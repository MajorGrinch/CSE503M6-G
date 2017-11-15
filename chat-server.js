// Require the packages we will use:
var http = require('http'),
    url = require('url'),
    path = require('path'),
    mime = require('mime'),
    path = require('path'),
    socketio = require('socket.io'),
    formidable = require('formidable'),
    util = require('util'),
    bcrypt = require('bcrypt'),
    Router = require('router'),
    finalhandler = require('finalhandler'),
    fs = require('fs');

const saltRounds = 10;
var router = Router();

var roomlist = ['330', '523'];
var privateRoomList = [];
var room_member = { '330': ['kevin'], '523': ['kevin']};
var room_owner = { '330': 'kevin', '523': 'kevin' }
var black_list = {};
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp) {
    if (req.method.toLowerCase() == 'post') {
        router(req, resp, finalhandler(req, resp));
    } else {
        // get
        var filename = path.join(__dirname, "static", url.parse(req.url).pathname);
        console.log(filename);
        (fs.exists || path.exists)(filename, function(exists) {
            if (exists) {
                fs.readFile(filename, function(err, data) {
                    if (err) {
                        // File exists but is not readable (permissions issue?)
                        resp.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        resp.write("Internal server error: could not read file");
                        resp.end();
                        return;
                    }

                    // File exists and is readable
                    var mimetype = mime.getType(filename);
                    resp.writeHead(200, {
                        "Content-Type": mimetype
                    });
                    resp.write(data);
                    resp.end();
                    return;
                });
            } else {
                // File does not exist
                resp.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                resp.write("Requested file not found: " + filename);
                resp.end();
                return;
            }
        });
    }
});

router.post('/register', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //store hashed password in mysql instead of plain text
        bcrypt.hash(fields['password'], saltRounds, function(err, hash) {
            User.create({
                username: fields['username'],
                password: hash
            }).then(function(a) {
                console.log('insert: ' + JSON.stringify(a));
                res.writeHead(200, { 'content-type': 'application/json' });
                res.write(JSON.stringify({ "status": "success" }));
                res.end();
            }).catch(function(err) {
                console.log('failed: ' + err);
                res.writeHead(200, { 'content-type': 'application/json' });
                res.write(JSON.stringify({ "status": "fail" }));
                res.end();
            });
        });

    });
});

router.post('/login', function(req, res) {
    var form = new formidable.IncomingForm();
    console.log('process login');
    form.parse(req, function(err, fields, files) {
        (async() => {
            var users = await User.findAll({
                attributes: ['username', 'password'],
                where: {
                    username: fields['username']
                }
            });
            res.writeHead(200, { 'content-type': 'application/json' });
            if (users.length > 0) {
                user = users[0];
                bcrypt.compare(fields['password'], user['password'], function(err, result) {
                    if (result == true) {
                        res.write(JSON.stringify({ "status": "success" }));
                    } else {
                        res.write(JSON.stringify({ "status": "fail" }));
                    }
                    res.end();
                });
            } else {
                res.write(JSON.stringify({ "status": "fail" }));
                res.end();
            }

        })();
    });
});

router.post('/getChatRooms', function(req, res) {
    console.log('process get chat rooms');
    var form = new formidable.IncomingForm();
    retData = {};
    form.parse(req, function(err, fields, files) {
        if (err) {
            // File exists but is not readable (permissions issue?)
            resp.writeHead(500, {
                "Content-Type": "text/plain"
            });
            resp.write("Internal server error");
            resp.end();
            return;
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        console.log(roomlist);
        retData['public'] = roomlist;
        retData['private'] = privateRoomList;
        res.write(JSON.stringify(retData));
        res.end();
    });

});

app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket) {
    // This callback runs when a new Socket.IO connection is established.
    socket.on('createRoom', function(data){
        console.log('process create room');
        var room = data['roomid'], user = data['username'];
        roomlist.push(room);
        room_owner[room] = user;
        console.log(room_owner);
        console.log(roomlist);
        room_member[room] = [user];
        console.log(room_member);
        io.sockets.emit('createRoom_rsp', {roomlist: roomlist});
    });

    socket.on('message_to_server', function(data) {
        // This callback runs when the server receives a new message from the client.

        console.log("message: " + data["message"]); // log it to the Node.JS output
        console.log('roomid: ' + data["roomid"]);
        console.log('from user: ' + data['username']);
        console.log('will send to: ' + room_member[data["roomid"]])
        io.sockets.emit("message_to_client", {
            message: data["message"],
            roomid: data["roomid"],
            src_user: data['username'],
            room_member: room_member[data["roomid"]]
        }); // broadcast the message to other users
    });

    socket.on('kick_user', function(data) {
        console.log(data);
        var trgt_user = data['trgt_user'];
        var roomid = data['roomid'];
        var index = room_member[roomid].contains(trgt_user);
        if (index != -1) {
            room_member[roomid].splice(index, 1);
        }
        io.sockets.emit("kick_user_rsp", {
            room_member: room_member[roomid],
            roomid: roomid,
            target: trgt_user,
            owner: room_owner[roomid]
        });
    });

    socket.on('kb_user', function(data) {
        console.log(data);
        var trgt_user = data['trgt_user'];
        var roomid = data['roomid'];
        var index = room_member[roomid].contains(trgt_user);
        if (index != -1) {
            room_member[roomid].splice(index, 1);
            if (black_list[roomid] == undefined) {
                black_list[roomid] = [];
            }
            black_list[roomid].push(trgt_user);
            console.log(black_list);
        }
        io.sockets.emit("kb_user_rsp", {
            room_member: room_member[roomid],
            roomid: roomid,
            target: trgt_user,
            owner: room_owner[roomid]
        });
    });

    socket.on('enterPublicRoom', function(data) {
        console.log('enter public room');
        var room = data['roomid'];
        var user = data['user'];
        console.log(user);
        var retData = {};
        if(black_list[room] != undefined ){
            if(black_list[room].contains(user) != -1){
                payload = {
                            msg: 'You are banned from this room',
                            trgt_user: user
                        }
                io.sockets.emit('enterPublicRoomFail_rsp', payload);
                return;
            }
        }
        retData['owner'] = room_owner[room];
        if (room_member[room].contains(user) != -1) {
            retData['roomid'] = room;
            retData['data'] = room_member[room];
            io.sockets.emit('enterPublicRoom_rsp', retData);
        } else {
            retData['roomid'] = room;
            room_member[room].push(user);
            console.log(room_member);
            console.log(room_member[room].contains(user));
            retData['data'] = room_member[room];
            io.sockets.emit('enterPublicRoom_rsp', retData);
        }
    });

    socket.on('enterPrivateRoom', function(data){
        console.log('enter private room');
        console.log(data);
        var roomid = data['roomid'];
        var user = data['user'];
        retData = {'owner': room_owner[roomid], 'roomid': roomid};
        if(black_list[roomid] != undefined){
            if(black_list[roomid].contains(user) != -1){
                retData['data'] = 'You are banned from this room';
                retData['trgt_user'] = user;
                io.sockets.emit('enterPrivateRoomFail_rsp', retData);
                return;
            }
        }
        
        if(user == room_owner[roomid]){
            //success
            retData['data'] = room_member[roomid];
            io.sockets.emit('enterPrivateRoom_rsp', retData);
            return;
        }
        if(room_member[roomid].contains(user) != -1){
            retData['data'] = room_member[roomid];
            io.sockets.emit('enterPrivateRoom_rsp', retData);
            return;
        }
        (async() => {
            var privateRooms = await PrivateRoom.findAll({
                attributes: ['roomid','owner', 'room_pwd'],
                where: {
                    roomid: data['roomid']
                }
            });
            if (privateRooms.length > 0) {
                privateRoom = privateRooms[0];
                bcrypt.compare(data['password'], privateRoom['room_pwd'], function(err, result) {
                    if(result == true){
                        //success
                        room_member[roomid].push(user);
                        console.log(room_member);
                        retData['data'] = room_member[roomid];
                        io.sockets.emit('enterPrivateRoom_rsp', retData);
                    }else{
                        //fail
                        retData['data'] = 'Wrong Password';
                        retData['trgt_user'] = user;
                        io.sockets.emit('enterPrivateRoomFail_rsp', retData);
                    }
                });
            } else {
                //fail
                retData['data'] = 'No such Room';
                retData['trgt_user'] = user;
                io.sockets.emit('enterPrivateRoomFail_rsp', retData);
            }

        })();
    });

    socket.on('createPrivateRoom', function(data){
        console.log('create private room');
        var roomid = data['roomid'];
        var user = data['user'];
        var password = data['password'];
        bcrypt.hash(password, saltRounds, function(err, hash) {
            PrivateRoom.create({
                roomid: roomid,
                owner: user,
                room_pwd: hash
            }).then(function(a) {
                console.log('insert: ' + JSON.stringify(a));
                privateRoomList.push(roomid);
                room_owner[roomid] = user;
                room_member[roomid] = [user];
                io.sockets.emit('createPrivateRoom_rsp', {privateRoomList: privateRoomList});
            }).catch(function(err) {
                console.log('failed: ' + err);
            });
        });
    });

    socket.on('pri_Msg_req', function(data){
        console.log('receive private message request');
        var src_user = data['src_user'];
        var dest_user = data['dest_user'];
        io.sockets.emit('pri_Msg_req_rsp', data);
    });

    socket.on('privateMessage', function(data){
        console.log('receive private message');
        console.log(data);
        var src_user = data['src_user'];
        var dest_user = data['dest_user'];
        io.sockets.emit('privateMessage_rsp', data);
    });
});

var Sequelize = require('sequelize'),
    config = require('./config');

var seq = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

seq.authenticate()
    .then(() => {
        console.log("connect successfully.");
    })
    .catch(err => {
        console.log("connect failed.");
    });

var User = seq.define('user', {
    userid: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    username: Sequelize.STRING(25),
    password: Sequelize.STRING(255)
}, {
    timestamps: false
});

var PrivateRoom = seq.define('privateRoom', {
    roomid: {
        type: Sequelize.STRING(25),
        primaryKey: true
    },
    owner: Sequelize.STRING(25),
    room_pwd: Sequelize.STRING(255)
}, {
    timestamps: false
});

(async() => {
    var privateRooms = await PrivateRoom.findAll({
        attributes: ['roomid', 'owner']
    });
    console.log('there are ' + privateRooms.length + ' private rooms');
    privateRooms.forEach(function(room){
        console.log(room['roomid']);
        privateRoomList.push(room['roomid']);
        room_owner[room['roomid']] = room['owner'];
        room_member[room['roomid']] = [room['owner']];
    });
    console.log('Private Room List '+privateRoomList);
    console.log(room_owner);
    console.log(room_member);
})();

Array.prototype.contains = function(needle) {
    for (i in this) {
        if (this[i] == needle) return i;
    }
    return -1;
}