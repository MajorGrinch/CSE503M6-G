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
var curr_room = "";
$('#chat_rooms').on('click', '.card', function() {
    console.log('click card');
    var room = $(this).find("h2").text();
    curr_room = room;
    console.log(room);
    $('#room_members').empty();
    $('#chat_log').empty();
    $.post('enterRoom', { roomid: room, username: curr_user })
        .done(function(data) {
            console.log(data);
            data.forEach(function(member) {
                $('#room_members').append('<div class="card"><div class="card-block"><h2>' + member + '</h2></div></div>');
            });
        });
});

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
    if (data['roomid'] == curr_room) {
        //Append an HR thematic break and the escaped HTML of the new message
        document.getElementById("chat_log").appendChild(document.createElement("hr"));
        document.getElementById("chat_log").appendChild(document.createTextNode(data['src_user']));
        $('#chat_log').append('<br/>');
        document.getElementById("chat_log").appendChild(document.createTextNode(data['message']));
        chat2Bottom();
    }

});

$('#chat_rooms').on('click', '#toggle_create_room', function() {
    console.log('click crate room');
    $('#create_room_modal').modal('show');
});

$('#create_room_btn').click(function() {
    var roomid = $('#create_room_id').val();
    $.post('createRoom', { roomid: roomid, username: curr_user })
        .done(function(data) {
            console.log(data);
            initRooms(data);
        });
    $('#create_room_modal').modal('hide');
});