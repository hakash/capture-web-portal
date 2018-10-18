var CWP = {

	formtypes : [
		"mobile",
		"email",
		"guest"
	],

	params : {
	},

	autherr : 0,
	
	 setCookie : function(cname, cvalue, minutes) {
		var d = new Date();
		d.setTime(d.getTime() + (minutes * 60 * 1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	},
	
	getCookie : function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	},

	init : function(){
		this.parseParams();
		this.loadParams();

		location.href = location.href.split("#")[0] != null ? location.href.split("#")[0] + "#" + this.getCookie("last_hash") : location.href + "#" + this.getCookie("last_hash");
		
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
		if(!this.params.url || this.params.url == ""){
			this.params.url = "http://www.dgi.no/";
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
				document.getElementById(this.formtypes[i] + "-id").value = this.getCookie(this.formtypes[i] + "-id");
			}
		}
	},

	checkForAuthErr : function(){
		console.log("logging_in: " + this.getCookie("logging_in"));
		console.log("last_hash: " + this.getCookie("last_hash"));
		if(this.params.autherr && this.params.autherr === "1"){
			if(location.href.indexOf("#") > -1){
				var hash = location.href.split("#")[1];
				if(hash === "autherrModal"){
					hash = "";
				}
				document.getElementById("autherrButtonClose").href = "#" + hash;
			}
			location.href = location.href.split("#")[0] + "#autherrModal";
			this.autherr = 1;
		} else if(this.getCookie("logging_in") === "1"){
			location.href = location.href.split("#")[0] + "#autherrModal";
			this.autherr = 1;
			document.getElementById("autherrButtonClose").href = "#" + this.getCookie("last_hash");
		}
	},
	
	detectEnter : function(event, callback, param){
		if(event.keyCode === 13){
			callback(param);
		}
	},

	login : function(type){
		console.log("ref: " + document.referrer);
		CWP.setCookie("logging_in",1, 1);			

		CWP.setCookie("last_hash", type + "Form", 30 * 24 * 60);
		CWP.setCookie(type + "-id", document.getElementById(type + "-id").value, 30 * 24 * 60);
		document.querySelector("#" + type + "Form form").submit();
	},

	getCode : function(type){
		
		var backendURL = "/code";

		var data = {};
		data.uri = JSON.stringify(CWP.params);
		data.type = type;
		data.userid = document.getElementById(type + "-id").value;

		CWP.jsonPost(backendURL, data, function(response){
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
