var CWP = {

	formtypes : [
		"mobile",
		"email",
		"guest"
	],

	params : {
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

	checkFaceBookLogin : function(){
		FB.getLoginStatus(function(response) {
			CWP.FBStatusCallback(response);
		});
	},

	FBStatusCallback : function(response){
		console.log(response);
		if(response.status === 'connected' ){
			// user logged in and approved our app.
			// welcome the user and redirect to page in uri

		}
		else if(response.status === 'not_authorized'){
			// user logged in to FB, but has not approved this app
			// log them in.
		}
		else if(response.status === 'unknown'){
			// user not logged in to FB
			// log them in.
		}
	},

	fblogin : function(a,b,c){
		console.log(a);
		console.log(b);
		console.log(c);
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

		this.ajaxPost(backendURL, data, function(response){
			document.getElementById(type + "-status").innerText = "Melding sendt!";
		},
		function(response){
			var msg = "Det oppstod en feil. Vennligst prøv igjen.";
			try {
				var data = JSON.parse(response);				
				if(data.error && data.error.message){
					msg = data.error.message;
				}
			}
			catch(error){
				var data = response;
				console.log(response);
			}

			document.getElementById(type + "-status").innerText = msg;
		});
				
		document.getElementById(type + "-status").innerText = "Vennligst vent!";
		document.getElementById(type + "-code").focus();
		
	},

	ajaxPost : function(url, data, success, error){
		var xhr = new XMLHttpRequest();

		var payload = JSON.stringify(data);

		xhr.open("POST", url, true);
		
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
		xhr.send(payload);
	},
}

document.addEventListener("DOMContentLoaded", function(event) { 
	//alert(document.referrer);
	
	CWP.init();
});