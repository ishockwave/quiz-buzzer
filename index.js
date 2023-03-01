const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'Buzzer'

let data = {
  users: new Set(),
  buzzes: new Set(),
  questions: new Array(),
}

const getData = () => ({
  users: data.users,
  buzzes: data.buzzes,
})

const getHostData = () => ({
  users: data.users,
  buzzes: data.buzzes,
  questions: data.questions,
})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/live', (req, res) => res.render('live', Object.assign({ title }, getData())))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getHostData())))

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    if (!(user.id in data.users)){
      data.users[user.id]= {id: user.id, name: user.name, sid: socket.id, points: 0}
    }
    else if (user.id in data.users & data.users[user.id]["sid"] == ""){
      data.users[user.id]["sid"] = socket.id
      data.users[user.id]["name"] = user.name
    }
    else if (user.id in data.users & data.users[user.id]["sid"] == socket.id){
      data.users[user.id]["name"] = user.name
    }
    io.emit('points', data.users)
  })

  socket.on('buzz', (buzz_data) => {
    if (!(data.buzzes[buzz_data[0].id])){
      data.buzzes[buzz_data[0].id] = {name: buzz_data[0].name, guess: buzz_data[1]}
      io.emit('buzzes', data.buzzes)
    }
  })

  socket.on('clear', () => {
    data.buzzes = new Set()
    io.emit('buzzes', data.buzzes)
  })

  socket.on('right', (socket_data) => {
    data.users[socket_data[0]]["points"] += parseInt(socket_data[1])
    io.emit('points', data.users)
  })

  socket.on('wrong', (socket_data) => {
    for(var user in data.users) {
      if(socket_data[0] != user){
        data.users[user]["points"] += parseInt(socket_data[1])
      }
    }
    io.emit('points', data.users)
  })

  socket.on('clearpoints', () => {
    for(user in data.users) {
      data.users[user]["points"] = 0
    }
    io.emit('points', data.users)
  })

  socket.on('guess', (time) => {
    io.emit('start_guess', time)
  })

  socket.on('mc', (time) => {
    io.emit('start_mc', time)
  })

  socket.on('save_questions', (socket_data) => {
    data.questions = socket_data
  })

  socket.on('new_question', (socket_data) => {
    io.emit('question', socket_data)
  })

  socket.on('blank', (selections) => {
    io.emit('blank_live', selections)
  })

  socket.on('disconnect', () => {
    for( user in data.users){
      if(data.users[user]["sid"] == socket.id){
        data.users[user]["sid"] = ""
      }
    }
    io.emit('points', data.users)
  });
})

server.listen(8090, () => console.log('Listening on 8090'))
