module.exports = (app, io) => {
  let currentUsers = 0
  io.on('connection', socket => {
    
    ++currentUsers
    io.emit('user', {
      username: socket.request.user.username,
      currentUsers,
      connected: true
    })
  
    socket.on('chat message', (message) => {
      io.emit('chat message', {
        username: socket.request.user.username,
        message: message
      })
    })
  
    socket.on('disconnect', () => {
      --currentUsers
      // Disconnected
      io.emit('user', {
        username: socket.request.user.username,
        currentUsers,
        connected: false
      })
    })
  })  
}
