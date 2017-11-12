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

var rooms = { '330': [23, 24] };
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
                    username: fields['username'],
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
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.write(JSON.stringify(rooms));
        res.end();
    });

});



app.listen(3456);
// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket) {
    // This callback runs when a new Socket.IO connection is established.

    socket.on('message_to_server', function(data) {
        // This callback runs when the server receives a new message from the client.

        console.log("message: " + data["message"]); // log it to the Node.JS output
        io.sockets.emit("message_to_client", {
            message: data["message"]
        }); // broadcast the message to other users
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