var curr_user = "";
$('#signin_btn').click(function() {
    var username = $('#input_username_box').val();
    var password = $('#input_password_box').val();
    console.log(username);
    console.log(password);
    $.post('login', { username: username, password: password })
        .done(function(data) {
            console.log(data);
            if (data['status'] == 'success') {
                alert('Sign in successfully.');
                $('#login_wrapper').empty();
                $('#login_wrapper').append('<h1>Welcome, ' + username + '</h1><br/>')
                getChatrooms(username);
                curr_user = username;
            } else {
                alert('Sign in failed.');
            }
        })
});


$("#signup_btn").click(function() {
    if ($("#new_password").val() === $("#confirm_pwd").val()) {
        var username = $("#new_username").val();
        var password = $("#new_password").val();
        $.post('register', { username: username, password: password })
            .done(function(data) {
                console.log(data);
                if (data['status'] == 'success') {
                    alert('Sign up successfully!');
                } else {
                    alert('Sign up failed!');
                }
            });
    } else {
        console.log("don't match");
    }
    $("#myModal").modal('hide');
});

function initRooms(data) {
    $('#chat_rooms').empty();
    data.forEach(function(room) {
        $('#chat_rooms').append('<div class="card"><div class="card-block"><h2>' + room + '</h2></div></div>');
    });
    $('#chat_rooms').append('<button class="btn btn-primary" id="toggle_create_room">Create Room</button>');
}

function getChatrooms(username) {
    $.post('getChatRooms', { username: username })
        .done(function(data) {
            console.log(data);
            initRooms(data);
        });
}

function owInitRoomMembers(data) {
    $('#room_members').empty();
    data.forEach(function(member) {
        if (member != curr_user) {
            $('#room_members').append('<div class="card"><div class="card-block"><h2>' + member + '</h2><button class="kick_user">Kick</button><button class="kb_user">Kick&Block</button></div></div>');
        } else {
            $('#room_members').append('<div class="card"><div class="card-block"><h2>' + member + '</h2></div></div>');
        }

    });
}

function initRoomMembers(data) {
    $('#room_members').empty();
    data.forEach(function(member) {
        $('#room_members').append('<div class="card"><div class="card-block"><h2>' + member + '</h2></div></div>');
    });
}
var curr_room = "";
$('#chat_rooms').on('click', '.card', function() {
    console.log('click card');
    var room = $(this).find("h2").text();
    curr_room = room;
    console.log(room);

    var roomlist = $(this).parent('#chat_rooms').find('.card');
    roomlist.css('background-color', 'white');
    $(this).css('background-color', 'gray');
    $('#room_members').empty();
    $('#chat_log').empty();
    console.log('You are in room: ' + curr_room);
    enterRoom(room, curr_user);
});

function enterRoom(roomid, username) {
    console.log(roomid + ' ' + username);
    socketio.emit("enterRoom", { roomid: roomid, user: username });
}

function sendMessage(room) {
    var msg = $('#message_input').val();
    console.log(msg);
    socketio.emit("message_to_server", { message: msg, roomid: room, username: curr_user });
    $('#message_input').val('');
}

$('#send_btn').click(function() {
    sendMessage(curr_room);
})

var socketio = io.connect();
socketio.on("message_to_client", function(data) {
    console.log(data);
    if (data['roomid'] == curr_room && data['room_member'].contains(curr_user) != -1) {
        //Append an HR thematic break and the escaped HTML of the new message
        document.getElementById("chat_log").appendChild(document.createElement("hr"));
        document.getElementById("chat_log").appendChild(document.createTextNode(data['src_user']));
        $('#chat_log').append('<br/>');
        document.getElementById("chat_log").appendChild(document.createTextNode(data['message']));
        chat2Bottom();
    }

});

socketio.on("kick_user_rsp", function(data) {
    console.log(data);
    if (data['roomid'] == curr_room) {
        if (data['target'] == curr_user) {
            curr_room = '';
            alert('You were kicked out of room ' + data['roomid']);
            initRoomMembers(data['room_member']);
        } else if (data['owner'] == curr_user) {
            console.log(data['room_member']);
            owInitRoomMembers(data['room_member']);
        } else {
            initRoomMembers(data['room_member']);
        }
    }
});

socketio.on("kb_user_rsp", function(data) {
    console.log(data);
    if (data['roomid'] == curr_room) {
        if (data['target'] == curr_user) {
            curr_room = '';
            alert('You were kicked out of room ' + data['roomid']);
            initRoomMembers(data['room_member']);
        } else if (data['owner'] == curr_user) {
            console.log(data['room_member']);
            owInitRoomMembers(data['room_member']);
        } else {
            initRoomMembers(data['room_member']);
        }
    }
});

socketio.on("enterRoom_rsp", function(data) {
    console.log("enter room rsp");
    console.log(data);
    if(data['roomid'] != curr_room){
    	return;
    }
    if (data['owner'] == curr_user) {
        owInitRoomMembers(data['data']);
    } else {
        initRoomMembers(data['data']);
    }
});

socketio.on("enterRoomFail_rsp", function(data){
	console.log('enter room fail');
	console.log(data);
	if(data['trgt_user'] == curr_user){
		alert(data['msg']);
	}
});

$('#chat_rooms').on('click', '#toggle_create_room', function() {
    console.log('click crate room');
    $('#create_room_modal').modal('show');
});

$('#create_room_btn').click(function() {
    var roomid = $('#create_room_id').val();
    var payload = { roomid: roomid, username: curr_user };
    socketio.emit('createRoom', payload);
    $('#create_room_modal').modal('hide');
});

socketio.on("createRoom_rsp", function(data){
	console.log("create room rsp");
	console.log(data);
	initRooms(data['roomlist']);
});

$('#room_members').on('click', '.kick_user', function() {
    console.log('kick user');
    var kick_user = $(this).parent('.card-block').find('h2').text();
    console.log(kick_user);
    var payload = { trgt_user: kick_user, roomid: curr_room };
    console.log(payload);
    socketio.emit('kick_user', payload);
});

$('#room_members').on('click', '.kb_user', function() {
    console.log('kick & block user');
    var kb_user = $(this).parent('.card-block').find('h2').text();
    console.log(kb_user);
    var payload = { trgt_user: kb_user, roomid: curr_room };
    socketio.emit('kb_user', payload);
});

Array.prototype.contains = function(needle) {
    for (i in this) {
        if (this[i] == needle) return i;
    }
    return -1;
}