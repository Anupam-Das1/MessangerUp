const chatForm = document.getElementById('chat-form')
const socket = io()
const roomName=document.getElementById('room-name')
const userList=document.getElementById('users')
const chatMessages=document.querySelector('.chat-messages')

// get user name and room from url
const {username,room} =Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
 
//join chatroom
socket.emit('joinRoom', {username,room})

//get room and users
socket.on('roomUsers',({users,room})=>{
    outputRoomName(room);
    outputUsers(users)
})

// Message from server
 socket.on('message', message=>{
     console.log(message)
     outputMessage(message)

     //scroll down
     chatMessages.scrollTop=chatMessages.scrollHeight
 })

 //message submit
 chatForm.addEventListener('submit', (e)=>{
     e.preventDefault();

     // get message text
     const msg=e.target.elements.msg.value
     //console.log(msg)

     //emitting a msg to server
     socket.emit('chatMessage', msg)

     //clear input
     e.target.elements.msg.value="";
     e,target.elements.msg.focus()
 })

 //output message to dom
  function outputMessage(message) {
      const div=document.createElement('div')
      div.classList.add('message')
      div.innerHTML=`<p class="meta">${message.username}<span>${message.time}</span></p>
      <p class="text">
         ${message.text}
      </p>`;
      document.querySelector('.chat-messages').appendChild(div)
  }

  // Add room name
  function outputRoomName(room) {
      roomName.innerText=room;

  }
  // add users to dom
  function outputUsers(users) {
      userList.innerHTML= `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
      `
  }