$('#signin_btn').click(function() {
	var username = $('#input_username_box').val();
	var password = $('#input_password_box').val();
	console.log(username);
	console.log(password);
	$.post('login', {username: username, password: password})
	.done(function(data){
		console.log(data);
		if(data['status'] == 'success'){
			alert('Sign in successfully.');
			$('#login_wrapper').empty();
			$('#login_wrapper').append('<h1>Welcome, ' + username+'</h1><br/>')
			getChatrooms();
		}
		else{
			alert('Sign in failed.');
		}
	})
});
$("#signup_btn").click(function() {
	if ($("#new_password").val() === $("#confirm_pwd").val()) {
		var username = $("#new_username").val();
		var password = $("#new_password").val();
		$.post('register', {username: username, password: password})
		.done(function(data){
			console.log(data);
			if(data['status'] == 'success'){
				alert('Sign up successfully!');
			}
			else{
				alert('Sign up failed!');
			}
		});
	} else {
		console.log("don't match");
	}
	$("#myModal").modal('hide');
});

function getChatrooms(username){
	$.post('getChatRooms', {username: username })
	.done(function(data){
		console.log(data);
		console.log(data['330']);		
	});
}