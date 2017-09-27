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

	},

	parseParams : function(){
		if(!(location.href.indexOf("?") > -1)){
			console.log("Querystring not found in URL: " + location.href);
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

	checkFaceBookLogin : function(){
		FB.getLoginStatus(function(response) {
			CWP.FBStatusCallback(response);
		});
	},

	FBStatusCallback : function(response, autologin){
		console.log(response);

		if(response.status === 'connected' ){
			// user logged in and approved our app.
			// welcome the user and redirect to page in uri
			CWP.FaceBook.token = response.authResponse.accessToken;
			CWP.FaceBook.password = SHA256(response.authResponse.accessToken);
			CWP.setFacebookButtonAsLogout();

			document.getElementById("facebook-username").value = CWP.FaceBook.email;
			document.getElementById("facebook-password").value = CWP.FaceBook.password;
			
			FB.api("/me",function(response){
				CWP.FaceBook.email = response.email;
				CWP.FaceBook.name = response.name;
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

	fblogin : function(){
		CWP.checkFaceBookLogin(true);
	},

	fblogout : function(){
		CWP.checkFaceBookLogin();
	},

	fbRenderingDone : function() {
		
	},

	login : function(type){
		return false;
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

			if(tmp = getErrorMessage(response)){
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
		data.username = this.FaceBook.email;
		data.password = this.FaceBook.password;

		this.jsonPost(url, data, (function(){
			return function(response){
				// success
				if(autologin){
					CWP.loginFacebookUser();					
				}
				else{
					window.location.href = window.location.href.split("#")[0] + "#facebookForm";
				}
			}
		})(response, autologin),
		function(response){
			// error
			var msg = "Det oppstod en feil. Vennligst prøv igjen.";
			var tmp;

			if(tmp = getErrorMessage(response)){
				msg = tmp;
			}
			document.getElementById(type + "-status").innerText = msg;
		});
	},

/*	loginFacebookUser : function(){

		var url = "/reg.php";
		
		var data = {};
		data.username = this.FaceBook.email;
		data.password = this.FaceBook.password;

		this.formPost(url, data, function(response){
			// success
			console.log("success:");
			console.log(response);		
		},
		function(response){
			// error
			console.log("error:");
			console.log(response);

/*
			var msg = "Det oppstod en feil. Vennligst prøv igjen.";
			var tmp;

			if(tmp = getErrorMessage(response)){
				msg = tmp;
			}
			document.getElementById(type + "-status").innerText = msg;

		});
	},
		*/				
	jsonPost : function(url, data, success, error){
		var xhr = new XMLHttpRequest();

		var payload = JSON.stringify(data);

		this.sendData(url, payload, success, error, {'Content-Type':'application/json'});
	},

	formPost : function(url, data, success, error){
		var urlEncodedData = "";
		var urlEncodedDataPairs = [];
		var name;
	  
		// Turn the data object into an array of URL-encoded key/value pairs.
		for(name in data) {
		  urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
		}
	  
		// Combine the pairs into a single string and replace all %-encoded spaces to 
		// the '+' character; matches the behaviour of browser form submissions.
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
	  
		// Set up our request
		xhr.open('POST', url);
	  
	  
		for(header in headers){
			// Add the required HTTP header for form data POST requests
			//XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');		
			xhr.setRequestHeader(header, headers[header]);		
		}

		// Finally, send our data.
		xhr.send(data);
	  }
}

if(document.addEventListener){
	document.addEventListener("DOMContentLoaded", function(event) { 
		//alert(document.referrer);
		
		CWP.init();
	});
}
else if(document.attachEvent){
	document.attachEvent("DOMContentLoaded", function(event) { 
		//alert(document.referrer);
		
		CWP.init();
	});
}
