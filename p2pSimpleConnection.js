var p2pSimpleConnection = function(userId){
	//apply PubSub mixin
	SimpleNotifications.call(this);

	// identification of myself
    this._userId = userId;

    // cached links to local andremote media streams
	this._localStream = false;
	this._remoteStream = false;

	// Instance of RTCPeerConnection object
	this._peerConnection = false;
	
	// Statuys: call starter or call target
	this._status = false;

	// Cached offer object
	this._offer = false;

	// In case if user not yet answer incoming call, 
	// but operation objects with candidates already transfered,
	// we need to store them, untill RTCPeerConnection instance will be created
    this._operationStack = [];

    // current state of instance
	this._setState('STATE_IDLE');
};

p2pSimpleConnection.prototype = {

	_setStatus: function(status) {
		this._status = status;
	},
	_setState: function(state) {
		this._state = state;
	},

	// Success handler for getUserMedia
	_onGetUserMediaSuccess: function(stream) {
		this.notify('LOCAL_MEDIA_STREAM', stream);
		this._localStream = stream;
		this._createPeerConnection();
	},

	// Success handler for getUserMedia
	_onGetUserMediaError: function(error) {
		this.notify('GET_USER_MEDIA_ERROR', error);
	},
	_getUserMedia: function(mediaStreams) {
		if (navigator.getUserMedia) {
			navigator.getUserMedia(mediaStreams, this._onGetUserMediaSuccess.bind(this), this._onGetUserMediaError.bind(this));
		} else if (navigator.webkitGetUserMedia) {
			navigator.webkitGetUserMedia(mediaStreams, this._onGetUserMediaSuccess.bind(this), this._onGetUserMediaError.bind(this));
		} else {
			this._onGetUserMediaError.call(this);
		}
	},

	// Generateoperation object with needed format
	_generateOperation: function(type, data) {
		var operation = {
            from: this._userId,
			type: type,
			data: data
		};
		return operation;
	},

	// Create RTCPeerConnection instance and initialize minimum needed handlers
	_createPeerConnection: function() {
		this._peerConnection = new webkitRTCPeerConnection({iceServers: []});

		// When ICE find new candidate
		this._peerConnection.onicecandidate = function(event){
            if (!event.candidate) {
                return;
            }
            var operation = this._generateOperation('TYPE_CANDIDATE', { "candidate": event.candidate });
            this.notify('NEW_OPERATION', operation);
        }.bind(this);

        // when remote media stream added
        this._peerConnection.onaddstream = function(event){
            this.notify('STREAM_ADDED', event.stream);
        }.bind(this);

        if (this._state == 'STATE_OUTGOING_CALL') {
            this._processPeerConnectionStarter();
        } else if (this._state == 'STATE_CALL_REQUEST') {
        	this._processPeerConnectionTarget();

            // If we have recieved operation objects - apply it
            if (this._operationStack.length > 0) {
                for (var i = 0, l = this._operationStack.length; i < l; i += 1) {
                    this.processOperation(this._operationStack[i]);
                }
                this._operationStack = null;
            }
        }
	},
	_processPeerConnectionStarter: function() {
		this._peerConnection.addStream(this._localStream);
        this._peerConnection.createOffer(
            function(offer){
                this._peerConnection.setLocalDescription(offer);
                var operation = this._generateOperation('TYPE_OFFER', offer);
                this.notify('NEW_OPERATION', operation);
            }.bind(this),
            function(error){
            	console.log('Error occurred while trying to create offer: ', error);
            }
        );
	},
	_processPeerConnectionTarget: function() {
		this._peerConnection.addStream(this._localStream);

		// apply remote description
        this._offer = new RTCSessionDescription(this._offerPlain);
        this._peerConnection.setRemoteDescription(this._offer);

        this._peerConnection.createAnswer(
            function(answer){
                this._peerConnection.setLocalDescription(answer);
                var operation = this._generateOperation('TYPE_ACCEPT_CALL', answer);
                this.notify('NEW_OPERATION', operation);
            }.bind(this),
            function(error){
            	console.log('Error occurred while trying to create answer: ', error);
            }
        );
	},
	processOperation: function(operation) {
		switch (operation.type) {
			case 'TYPE_OFFER':
				if (this._status !== false) {
					return;
				}
                this._setState('STATE_CALL_REQUEST');
                this._offerPlain = operation.data;
                this.notify('INCOMING_CALL', null);
				break;
			case 'TYPE_ACCEPT_CALL':
				if (this._status !== 'STATUS_STARTER') {
					return;
				}
                this._answerPlain = operation.data;
                this._answer = new RTCSessionDescription(this._answerPlain);
                this._peerConnection.setRemoteDescription(this._answer);
                this._setState('STATE_ACTIVE_CALL');
				break;
			case 'TYPE_CANDIDATE':
                if (!this._peerConnection) {
                    this._operationStack.push(operation);
                } else {
                    this._peerConnection.addIceCandidate(new RTCIceCandidate(operation.data.candidate));
                }
				break;

			default:
				return;
		}
	},
	startCall: function() {
		this._setStatus('STATUS_STARTER');
		this._setState('STATE_OUTGOING_CALL');
		this._getUserMedia({video: true, audio: true});
	},
	answerCall: function() {
        this._getUserMedia({video: true, audio: true});
	}
};