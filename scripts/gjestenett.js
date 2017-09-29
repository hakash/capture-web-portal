var CWP = {

	formtypes : [
		"mobile",
		"email",
		"guest",
		"facebook"
	],

	params : {
	},

	FaceBook : {
	},
	
	init : function(){
		this.parseParams();
		this.loadParams();
		this.checkForAuthErr();
	},

	parseParams : function(){
		if(!(location.href.indexOf("?") > -1)){
			return;
		}
		var paramsString = location.href.split("?")[1].split("#")[0];
		var paramsPairs = paramsString.split("&");
		for(var i = 0; i < paramsPairs.length; i++){
			if( paramsPairs[i].indexOf("=") > -1){
				var paramPair = paramsPairs[i].split("=");
				this.params[paramPair[0]] = paramPair[1];
			}
		}
	},

	loadParams : function(){
		for( var key in this.params){
			for(var i = 0; i < this.formtypes.length; i++){
				var id = this.formtypes[i] + "-" + key.toLowerCase();
				var element = document.getElementById(id);
				if(element != null){
					element.value = this.params[key];
				}
			}
		}
	},

	checkForAuthErr : function(){
		if(this.params.autherr && this.params.autherr === "1"){
			if(location.href.indexOf("#") > -1){
				var hash = location.href.split("#")[1];
				document.getElementById("autherrButtonClose").href = "#" + hash;
			}
		}
	},

	fbSetupComplete : function(){
		this.setFacebookButtonAsLogin();
		
		this.checkFaceBookLogin();
	},

	setFacebookButtonAsLogin : function(){
		document.getElementById("fb-button").onclick = function(event){
			FB.login(CWP.fblogin, { scope:"public_profile,email"} );
		};
		document.getElementById("fb-button-text").innerHTML = "Logg inn";
	},

	setFacebookButtonAsLogout: function(){
		document.getElementById("fb-button").onclick = function(event){
			FB.logout(CWP.fblogout);
		};
		document.getElementById("fb-button-text").innerHTML = "Logg ut";
	},

	checkFaceBookLogin : function(autologin){
		FB.getLoginStatus(function(response) {
			CWP.FBStatusCallback(response, autologin);
		});
	},

	FBStatusCallback : function(response, autologin){
		
		if(response.status === 'connected' ){
			// user logged in and approved our app.
			// welcome the user and redirect to page in uri
			CWP.FaceBook.token = response.authResponse.accessToken;
			CWP.FaceBook.password = SHA256(response.authResponse.accessToken);
			CWP.setFacebookButtonAsLogout();
			
			FB.api("/me",function(response){
				CWP.FaceBook.email = response.email;
				CWP.FaceBook.name = response.name;

				document.getElementById("facebook-username").value = CWP.FaceBook.email;
				document.getElementById("facebook-password").value = CWP.FaceBook.password;
				document.getElementById("facebook-name").innerHTML = CWP.FaceBook.name;

				if(autologin){
					CWP.registerFacebookUser(autologin);
				}
				else {
					CWP.showFacebookForm();
				}
			},{'fields':'name,email'});
		}
		else if(response.status === 'not_authorized'){
			// user logged in to FB, but has not approved this app
			// log them in.
			CWP.setFacebookButtonAsLogin();
		}
		else if(response.status === 'unknown'){
			// user not logged in to FB
			// log them in.
			CWP.setFacebookButtonAsLogin();
		}
	},

	login : function(type){
		if(type === "facebook"){
			this.registerFacebookUser(true);
		}
		else {
			document.querySelector("#" + type + "Form form").submit();
		}
	},

	fblogin : function(){
		CWP.checkFaceBookLogin(true);
	},

	fblogout : function(){
		CWP.checkFaceBookLogin();
	},

	loginFacebook : function(){
		document.querySelector("#facebookForm form").submit();
	},

	showFacebookForm : function(){
		window.location.href = window.location.href.split("#")[0] + "#facebookForm";		
	},

	getCode : function(type){
		
		var backendURL = "/code";

		var data = {};
		data.uri = JSON.stringify(this.params);
		data.type = type;
		data.userid = document.getElementById(type + "-id").value;

		this.jsonPost(backendURL, data, function(response){
			document.getElementById(type + "-status").innerText = "Melding sendt!";
		},
		function(response){
			var msg = "Det oppstod en feil. Vennligst prøv igjen.";
			var tmp;

			if(tmp = CWP.getErrorMessage(response)){
				msg = tmp;
			}
			document.getElementById(type + "-status").innerText = msg;
		});
				
		document.getElementById(type + "-status").innerText = "Vennligst vent!";
		document.getElementById(type + "-code").focus();
		
	},

	getErrorMessage : function(response){
		try {
			var data = JSON.parse(response);				
			if(data.error && data.error.message){
				return data.error.message;
			}
		}
		catch(error){
			var data = response;
			console.log(response);
		}
		return false;
	},

	registerFacebookUser : function(autologin){
		var url = "/facebookuser";

		var data = {};
		data.uri = JSON.stringify(this.params);
		data.userid = this.FaceBook.email;
		data.password = this.FaceBook.password;

		this.jsonPost(url, data, function(response){
			// success
			if(autologin){
				CWP.loginFacebook();
			}
			else {
				CWP.showFacebookForm();
			}
		},
		function(response){
			// error
			var msg = "Det oppstod en feil ved registreringen av Facebook-kontoen din i \
						våre systemer. Vennligst prøv en annen innloggingsmetode.";

			document.querySelector("#facebookForm > p").innerText = msg;
			document.querySelector("#facebookForm form input[type='submit']").style = "display:none;";
			CWP.showFacebookForm();
		});
	},

	jsonPost : function(url, data, success, error){
		var xhr = new XMLHttpRequest();

		var payload = JSON.stringify(data);

		this.sendData(url, payload, success, error, {'Content-Type':'application/json'});
	},

	formPost : function(url, data, success, error){
		var urlEncodedData = "";
		var urlEncodedDataPairs = [];
		var name;
	  
		for(name in data) {
		  urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
		}
	  
		urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

		this.sendData(url, urlEncodedData, success, error, {'Content-Type':'application/x-www-form-urlencoded'});
	},

	sendData : function(url, data, success, error, headers) {
		var xhr = new XMLHttpRequest();
	  			
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4){
				if( xhr.status === 200) {
					success(xhr.response);
				}
				else {
					error(xhr.response);
				}
			}
		}
	  
		xhr.open('POST', url);

		for(header in headers){
			xhr.setRequestHeader(header, headers[header]);		
		}

		xhr.send(data);
	  }
}

if(document.addEventListener){
	document.addEventListener("DOMContentLoaded", function(event) { 
		CWP.init();
	});
}
else if(document.attachEvent){
	document.attachEvent("DOMContentLoaded", function(event) { 
		CWP.init();
	});
}
