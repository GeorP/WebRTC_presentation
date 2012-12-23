Source code of the example shown at the KharkivJS
=================================================

These source code examples for the presentation [Real-time communication between browsers. WebRTC.](http://sdrv.ms/Rv0M7b) shown in [Kharkiv](http://kharkivjs.com/) on December 15 at the conference KharkivJS.
Presentation and example prepared in accordance with the [W3C Working Draft 21 August 2012](http://www.w3.org/TR/2012/WD-webrtc-20120821/).
Example was tested on Chrome 23.
Specifications may change in the future, as well as the implementation WebRTC in future versions of Google Chrome browser.


Files description
----------------

**http.js** -- HTTP server running on NodeJS, used to load our page and libs

**server.js** -- WebSocket server running on NodeJS, used to transfer all needed data between peers, during peer-to-peer connection establishment

**Event.js** -- PubSub mixin

**p2pSimpleConnection.js** -- simple library that helps us work with RTCPeerConnection object


Configure and run example
---------------------------------

* You need installed [NodeJS](http://nodejs.org/)
* You need installed [socket.io](http://socket.io/)
* Edit **port** variable at the beginning of the http.js file -- this port will be used by http server
* Make sure that in http.js file, variable **routeMap** (key "/socketio"), path to socket.io library is correct
* Edit **port** variable at the beginning of the server.js file -- this port will be used by websocket server
* Run http and websocket server:
   $ node http.js
   $ node server.js
* If you didn't change http server port, then open in Chrome 23 url 'http://localhost:81/' (or use port that you set)
