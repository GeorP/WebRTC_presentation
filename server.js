var port = 8081;
var io = require('socket.io').listen(port);

var people = {};
var nickList = [];

function notifyAll(instruction, data, exclusion) {
    for (var i = 0, l = nickList.length; i < l; i += 1) {
        var currentNick = nickList[i];
        if (exclusion && currentNick == exclusion) {
            continue;
        }
        people[currentNick].connection.emit(instruction, data);
    }
}

function getUserList() {
    var list = [];
    for (var i = 0, l = nickList.length; i < l; i += 1) {
        list.push(nickList[i]);
    }
    return list;
}

io.sockets.on('connection', function (socket) {
    socket.on('login', function (data, callback) {
        var nick = data.nick;
        if (nickList.indexOf(nick) < 0) {
            nickList.push(nick);
            people[nick] = {
                nick: nick,
                connection: socket
            }
        }
        callback({
            error: 0,
            user_list: getUserList()
        });
        notifyAll('user_list_updated', {user_list: getUserList()}, nick);
    });

    socket.on('transfer_operation', function (data, callback) {
        var nick = data.target;
        var operation = data.operation;

        if (typeof people[nick] == 'undefined') {
            callback({status: 'no_such_user', target: data.target});
        } else {
            people[nick].connection.emit('new_operation', {operation: operation});
            callback({
                error: 0
            });
        }
    });

    socket.on('get_user_list', function (data, callback) {
        var nick = data.nick;
        callback({
            error: 0,
            user_list: getUserList()
        });
    });

    socket.on('disconnect', function () {
        var nick;
        for (var i = 0, l = nickList.length; i < l; i += 1) {
            var currentNick = nickList[i];
            if (people[currentNick].connection.id == socket.id) {
                nick = currentNick;
                nickList.splice(i, 1);
                delete people[nick];
                notifyAll('user_list_updated', {user_list: getUserList()});
                break;
            }
        }
    });
});