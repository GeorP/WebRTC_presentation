var port = 81;
var http = require('http');
var url = require("url");
var routeMap = {
    '/': {
        contentType: 'text/html',
        file: 'v1.html'
    },
    '/event': {
        contentType: 'text/javascript',
        file: 'Events.js'
    },
    '/p2p': {
        contentType: 'text/javascript',
        file: 'p2pSimpleConnection.js'
    },
    '/socketio': {
        contentType: 'text/javascript',
        file: './node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'
    }
}

function processPage(req, res, pageData) {
    res.writeHead(200, { 
        'Content-Type': pageData.contentType,
        'Cache-Control': 'no-cache, must-revalidate' 
    });
    var readFile = require('fs').readFile;
    readFile(pageData.file, function (err, data) {
        if (err) {
            res.write('Error reading file ' + pageData.file);
            res.write('<br />');
            res.end(err.toString());
            return;
        }
        res.end(data);

    });
}

function route(req, res) {
    var pathname = url.parse(req.url).pathname;
    if (routeMap[pathname]) {
        processPage(req, res, routeMap[pathname]);
    } else {
        res.writeHead(302, { 'Content-Type': 'text/html' });
        res.write('<h1>Path not found:</h1>');
        res.write('<br />');
        res.end(pathname);
    }
}


http.createServer(function (req, res) {
    route(req, res);
}).listen(port);