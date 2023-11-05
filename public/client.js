$(document).ready(function () {
  let socket = io()

  socket.on('user', (data) => {
    const { username, currentUsers, connected } = data
    $("#num-users").text(currentUsers + " users online")

    let message = username + (connected 
                              ? " has joined the chat." 
                              : "has left the chat")

    $("#messages").append($("<li>").html(`<b>${message}</b>`))
  })

  socket.on('chat message', (data) => {
    const { username, message } = data

    let textMessage = `${username}: ${message}`
    $("#messages").append($("<li>").text(textMessage))
  })

  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
