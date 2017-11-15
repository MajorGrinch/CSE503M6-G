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
                $('#login_wrapper').append('<h4>Welcome, ' + username + '</h4><br/>')
                getChatrooms(username);
                curr_user = username;
            } else {
                alert('Sign in failed.');
            }
        })
});
var socketio = io.connect();

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

function initPublicRooms(data) {
    $('#public_rooms').empty();
    data.forEach(function(room) {
        $('#public_rooms').append('<div class="card"><div class="card-block"><div class="room"><h5>' + room + '</h5></div></div></div>');
    });
}

function initPrivateRooms(data) {
    $('#private_rooms').empty();
    data.forEach(function(room) {
        $('#private_rooms').append('<div class="card"><div class="card-block"><div class="room"><h5>' + room + '</h5><span class="badge badge-danger">private</span></div></div></div>');
    });
}

function getChatrooms(username) {
    $.post('getChatRooms', { username: username })
        .done(function(data) {
            console.log(data);
            initPublicRooms(data['public']);
            initPrivateRooms(data['private']);
        });
}

function owInitRoomMembers(data) {
    $('#room_members').empty();
    data.forEach(function(member) {
        if (member != curr_user) {
            $('#room_members').append('<div class="card"><div class="card-block"><div class="member"><h5>' + member + '</h5><button class="kick_user">Kick</button><button class="kb_user">Kick&Block</button></div></div></div>');
        } else {
            $('#room_members').append('<div class="card"><div class="card-block"><div class="member"><h5>' + member + '</h5></div></div></div>');
        }
    });
}

function initRoomMembers(data) {
    $('#room_members').empty();
    data.forEach(function(member) {
        $('#room_members').append('<div class="card"><div class="card-block"><div class="member"><h5>' + member + '</h5></div></div></div>');
    });
}
var curr_room = "";

//enter a public room
var public_room_target = '';
$('#public_rooms').on('click', '.card', function() {
    console.log('enter public room');
    var room = $(this).find("h5").text();
    public_room_target = room;
    // console.log(room);

    var roomlist = $(this).parent('#public_rooms').find('.card');
    var privateroomlist = $('#private_rooms').find('.card');
    privateroomlist.css('background-color', '#373C38'); //white
    roomlist.css('background-color', '#373C38'); //white
    $(this).css('background-color', 'gray'); //gray
    $('#room_members').empty();
    $('#chat_log').empty();
    console.log('You are entering room: ' + public_room_target);
    enterPublicRoom(room, curr_user);
    $('#login_wrapper').find('h6').remove();
    //Tell users which room they have entered
    $('#login_wrapper').append('<h6>Welcome to room , ' + public_room_target + '</h6>')
});

function enterPublicRoom(roomid, username) {
    console.log(roomid + ' ' + username);
    socketio.emit("enterPublicRoom", { roomid: roomid, user: username });
}
var private_room_target = '';
// enter a private room
$('#private_rooms').on('click', '.card', function() {
    console.log('enter private room');
    var room = $(this).find('h5').text();
    private_room_target = room;
    console.log(private_room_target);
    var publicroomlist = $('#public_rooms').find('.card');
    publicroomlist.css('background-color', '#373C38'); //white
    var roomlist = $(this).parent('#private_rooms').find('.card');
    roomlist.css('background-color', '#373C38'); //white
    $(this).css('background-color', 'gray'); //gray
    // console.log(roomlist);
    $('#enter_private_room_modal').modal('show');
    $('#login_wrapper').find('h6').remove();
    //Tell users which room they have entered
    $('#login_wrapper').append('<h6>Welcome to room , ' + private_room_target + '</h6>')
});

function enterPrivateRoom(roomid, username, password) {
    var payload = { roomid: roomid, user: username, password: password };
    socketio.emit('enterPrivateRoom', payload);
}

$('#enter_private_room_btn').click(function() {
    console.log('enter private room btn');
    var password = $('#private_room_password').val();
    if (private_room_target != '') {
        enterPrivateRoom(private_room_target, curr_user, password);
    }
    $('#enter_private_room_modal').modal('hide');
});

socketio.on("enterPrivateRoom_rsp", function(data) {
    if (data['roomid'] != private_room_target) {
        return;
    }
    if (data['owner'] == curr_user) {
        owInitRoomMembers(data['data']);
    } else {
        initRoomMembers(data['data']);
    }
    curr_room = data['roomid'];
    $('#chat_log').empty();
    $('#send_btn').unbind('click');
    $('#send_btn').click(function() {
        sendMessage(curr_room);
    });
});

socketio.on("enterPrivateRoomFail_rsp", function(data) {
    console.log("enter private room failed.");
    console.log(data);
    if (data['trgt_user'] == curr_user) {
        alert(data['data']);
    }
});

function sendMessage(room) {
    var msg = $('#message_input').val();
    console.log(msg);
    socketio.emit("message_to_server", { message: msg, roomid: room, username: curr_user });
    $('#message_input').val('');
}

function sendPrivateMessage(src_user, dest_user) {
    var msg = $('#message_input').val();
    console.log(msg);
    console.log('private message');
    socketio.emit('privateMessage', { message: msg, src_user: src_user, dest_user: dest_user });
    $('#message_input').val('');
}

socketio.on("message_to_client", function(data) {
    console.log('message to client');
    console.log(data);
    console.log(curr_room);
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

socketio.on("enterPublicRoom_rsp", function(data) {
    console.log("enter public room rsp");
    console.log(data);
    if (data['roomid'] != public_room_target) {
        return;
    }
    if (data['owner'] == curr_user) {
        owInitRoomMembers(data['data']);
    } else {
        initRoomMembers(data['data']);
    }
    curr_room = data['roomid'];
    $('#send_btn').unbind('click');
    $('#send_btn').click(function() {
        sendMessage(curr_room);
    });
});

socketio.on("enterPublicRoomFail_rsp", function(data) {
    console.log('enter room fail');
    console.log(data);
    if (data['trgt_user'] == curr_user) {
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

$('#chat_rooms').on('click', '#toggle_create_private_room', function() {
    $('#create_private_room_modal').modal('show');
});

$('#create_private_room_btn').click(function() {
    console.log('click create private room btn');
    var roomid = $('#create_private_room_id').val();
    var password = $('#create_private_room_password').val();
    var confirm_pwd = $('#confirm_private_room_password').val();
    if (password == confirm_pwd) {
        var payload = { roomid: roomid, user: curr_user, password: password };
        socketio.emit('createPrivateRoom', payload);
    } else {
        alert('Please enter the same password in confirm box');
    }
    $('#create_private_room_modal').modal('hide');
});

socketio.on("createRoom_rsp", function(data) {
    console.log("create room rsp");
    console.log(data);
    initPublicRooms(data['roomlist']);
});

socketio.on("createPrivateRoom_rsp", function(data) {
    console.log("create private room rsp");
    console.log(data);
    initPrivateRooms(data['privateRoomList']);
});

$('#room_members').on('click', '.kick_user', function() {
    console.log('kick user');
    var kick_user = $(this).parent('.member').find('h5').text();
    console.log(kick_user);
    var payload = { trgt_user: kick_user, roomid: curr_room };
    console.log(payload);
    socketio.emit('kick_user', payload);
});

$('#room_members').on('click', '.kb_user', function() {
    console.log('kick & block user');
    var kb_user = $(this).parent('.member').find('h5').text();
    console.log(kb_user);
    var payload = { trgt_user: kb_user, roomid: curr_room };
    socketio.emit('kb_user', payload);
});


$('#room_members').on('dblclick', '.card', function() {
    var member = $(this).find('h5').text();
    console.log(member);
    console.log('double click on ' + member);
    if(member == curr_user){
        return;
    }
    var payload = { src_user: curr_user, dest_user: member };
    socketio.emit('pri_Msg_req', payload);
});

socketio.on('pri_Msg_req_rsp', function(data) {
    if (data['dest_user'] == curr_user) {
        $('#private_users').append('<div class="card"><div class="card-block"><div class="room"><h5>' + data['src_user'] + '</h5></div></div></div>');
    }
    if (data['src_user'] == curr_user) {
        $('#private_users').append('<div class="card"><div class="card-block"><div class="room"><h5>' + data['dest_user'] + '</h5></div></div></div>');
    }
});

//enter private message
$('#private_users').on('click', '.card', function() {
    console.log('enter private message');
    var user = $(this).find("h5").text();
    public_room_target = '';
    private_room_target = '';
    var publicroomlist = $('#public_rooms').find('.card');
    var privateroomlist = $('#private_rooms').find('.card');
    privateroomlist.css('background-color', '#373C38'); //white
    publicroomlist.css('background-color', '#373C38'); //white
    $(this).css('background-color', 'gray'); //gray
    $('#room_members').empty();
    $('#chat_log').empty();
    $('#login_wrapper').find('h6').remove();
    //Tell users which room they have entered
    $('#login_wrapper').append('<h6>Chatting with' + user + '</h6>');
    curr_room = user;
    $('#send_btn').unbind('click');
    $('#send_btn').click(function() {
        sendPrivateMessage(curr_user, user);
    });
});

socketio.on('privateMessage_rsp', function(data){
    console.log(data);
    if((data['dest_user'] == curr_user && data['src_user'] == curr_room )|| (data['src_user'] == curr_user && data['dest_user'] == curr_room)){
        document.getElementById("chat_log").appendChild(document.createElement("hr"));
        document.getElementById("chat_log").appendChild(document.createTextNode(data['src_user']));
        $('#chat_log').append('<br/>');
        document.getElementById("chat_log").appendChild(document.createTextNode(data['message']));
        chat2Bottom();
    }
});

function connectPrivateUser() {
    console.log('connect private user');
}
Array.prototype.contains = function(needle) {
    for (i in this) {
        if (this[i] == needle) return i;
    }
    return -1;
}