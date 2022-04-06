/*
 * This module makes using WebSockets easy.
 * send supports stringifying objects
 * and if you add functions as properties to the webSocket object
 * they will be called automatically if a matching cmd string value exists.  
 */

var webSocket = {};

function isObject(val) {
    if (val === null) { return false;}
    return typeof val === 'object';
}

webSocket.send = function(msg) {
	if (this.connection.readyState == 1)
		this.connection.send( isObject(msg) ? JSON.stringify(msg) : msg);
	else if (this.connection.readyState == 0) {
		console.log("Not connected. Queuing message on open event.")
		this.connection.addEventListener("open", function(e) {
			webSocket.connected = true;
		    console.log("open event");
			this.send( isObject(msg) ? JSON.stringify(msg) : msg);
		}, false);
	} else {
		console.log("Connection closed. Can't send msg.")
	}
};

var wsurl = ((window.location.protocol == 'http:') ? 'ws://' : 'wss://')
		+ window.location.host
		+ ((window.location.pathname.length == 0)
				|| (window.location.pathname == '/') ? '' : '/'
				+ window.location.pathname.split('/')[1]) + '/websocket';

try {
	webSocket.connection = new WebSocket(wsurl);
	webSocket.connection.binaryType = 'arraybuffer';
	webSocket.connection.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};

	webSocket.connection.onclose = function(error) {
		console.log('WebSocket closed');
		webSocket.connected = false;
	};
	
	webSocket.connection.onmessage = function(messageEvent) {
		var msgData = JSON.parse(messageEvent.data);
		var fn = webSocket[msgData.cmd];
	    if(typeof fn !== 'function') {
	    	console.log(typeof JSON.parse(messageEvent.data));
	        return;
	    }
	    fn(msgData);
	};
} catch (e) {
	console.log('WebSocket Exception: ' + e);
}

webSocket.close = function() {
	if (this.connection.readyState == 1)
		this.connection.close();
};

export default webSocket;
