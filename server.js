const path = require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const formatMessage=require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUser}=require('./utils/user')
const { Socket } = require('dgram')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

//set static folder
app.use(express.static(path.join(__dirname,  'public')));

const botName= 'MessangerUp'

// Run when client connects
io.on('connection', socket =>{
    //console.log('New WS Connection........')

    socket.on('joinRoom',({username,room})=>{

        const user=userJoin(socket.id,username,room);
        socket.join(user.room)

        socket.emit('message', formatMessage(botName,'Welcome to MessangerUp') )

        //Broadcast when  a user connect
        socket.broadcast.to(user.room).emit('message', 
         formatMessage(botName,`${user.username} has joined the chat`) )

        // send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUser(user.room)
        })

    })


    // listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username,msg) )
    })

     // Runs when clients disconnects
     socket.on('disconnect',()=>{
        const user=userLeave(socket.id)

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))
        }
        // send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUser(user.room)
        })

    })

})

const PORT = 3000  || process.env.PORT;

server.listen(PORT, ()=> console.log(`server on ${PORT}`));