var SimpleNotifications = (function(){
	function subscribe(event, handler, thisArg) {
		if (!this._pubSubEvents[event]) {
			this._pubSubEvents[event] = [{handler: handler, thisArg: thisArg}];
		} else {
			var handlers = this._pubSubEvents[event];
			for (var i = 0, l = handlers.length; i < l; i += 1) {
				if (handlers[i].handler === handler && handlers[i].thisArg = thisArg) {
					return;
				}
			}
			this._pubSubEvents[event].push({handler: handler, thisArg: thisArg});
		}
	}

	function unsubscribe(event, handler, thisArg) {
		var handlers = this._pubSubEvents[event];
			for (var i = 0, l = handlers.length; i < l; i += 1) {
				if (handlers[i].handler === handler && handlers[i].thisArg = thisArg) {
					handlers.splice(i, 1);
					return;
				}
			}
	}

	function notify(event, data) {
		if (!this._pubSubEvents[event]) {
			return;
		}
		this._pubSubEvents[event].forEach(function(el){
			try {
				el.handler.call(el.thisArg, data);
			}
			catch(e){}
		});
	}

	return function() {
		this._pubSubEvents = {};
		this.subscribe = subscribe;
		this.unsubscribe = unsubscribe;
		this.notify = notify;
	}
}())