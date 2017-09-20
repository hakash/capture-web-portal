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

	fblogin : function(a,b,c){
		console.log(a);
		console.log(b);
		console.log(c);
	},

	login : function(type){
		return false;
	},

	getCode : function(type){
		
		var xhr = new XMLHttpRequest();
		var backendURL = "/code";

		var uri = JSON.stringify(this.params);

		var data = {};
		data.uri = uri;
		data.type = type;
		data.userid = document.getElementById(type + "-id").value;
		var payload = JSON.stringify(data);

		xhr.open("POST", backendURL, true);
		
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4 && xhr.status === 200) {
				document.getElementById(type + "-status").innerText = "Melding sendt!";
				console.log(xhr.response);
			}
			else {
				console.log(xhr.status);
				console.log(xhr.response);
			}
		}
		xhr.send(payload);
		
		document.getElementById(type + "-status").innerText = "Vennligst vent!";
		document.getElementById(type + "-code").focus();
		
	},
}

document.addEventListener("DOMContentLoaded", function(event) { 
	//alert(document.referrer);
	
	CWP.init();
});