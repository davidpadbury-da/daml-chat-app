import React, { Component } from 'react'
import { onChange } from './utils'
import ChatManager from './ChatManager'
import RoomList from './components/RoomList';
import ChatSession from './components/ChatSession';
import RoomUsers from './components/RoomUsers'
import { animateScroll } from 'react-scroll'
import queryString from 'query-string'
import Textarea from 'react-textarea-autosize'
import rsaSign from 'jsrsasign'

import 'skeleton-css/css/normalize.css'
import 'skeleton-css/css/skeleton.css'
import './App.css';

const { party, ledgerId } = queryString.parse(window.location.search)

if (!party) {
  alert('party parameter is missing 😿')
}

if (!ledgerId) {
  alert('ledgerId parameter is missing 😿')
}

function generateToken(party, ledgerId, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    ledgerId, party,
    applicationId: 'daml-chat-app'
  }

  return rsaSign.jws.JWS.sign(
    'HS256',
    JSON.stringify(header),
    JSON.stringify(payload),
    secret
  )
}

const token = generateToken(party, ledgerId, 'secret')
const GIPHY_TOKEN = 'kDqbzOZtPvy38TLdqonPnpTPrsLfW8uy'
let priorRooms

class App extends Component {
  constructor() {
    super();
    this.state = {
      userId: '',
      showLogin: true,
      isLoading: false,
      currentUser: party,
      currentRoom: null,
      rooms: [],
      roomUsers: [],
      roomName: null,
      messages: [],
      newMessage: '',
    };

    this.chatManager = new ChatManager(party, token, onChange(rooms => {
      const { currentRoom } = this.state

      const newRoom = currentRoom && rooms.filter(r => r.id === currentRoom.id)[0] || rooms[0]

      this.setState({
        userId: party,
        currentUser: party,
        rooms: rooms,
        ...this.updateCurrentRoomState(newRoom)
      })
    }))

    this.handleInput = this.handleInput.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.updateCurrentRoomState = this.updateCurrentRoomState.bind(this)
    this.messageKeyDown = this.messageKeyDown.bind(this)
  }

  componentDidMount() {
    this.scrollToLatestMessages()
  }

  componentDidUpdate() {
    this.scrollToLatestMessages()
  }

  scrollToLatestMessages() {
    animateScroll.scrollToBottom({
      containerId: 'chat-messages'
    })
  }

  updateCurrentRoomState(room) {
    return {
      roomName: room && room.channelName,
      currentRoom: room,
      roomUsers: room && room.members,
      messages: (room && room.messages) || []
    }
  }

  sendMessage(event) {
    event.preventDefault()
    const { newMessage, currentUser, currentRoom } = this.state

    if (newMessage.trim() === '') return

    const match = /\/(\w+) (.*)/.exec(newMessage)
    const command = match ? match[1] : 'send'
    const content = match ? match[2] : newMessage

    switch (command) {
      case 'send':
        if (!currentRoom) return alert("You must be in a room to send a message.")
        this.chatManager.sendMessage(currentRoom, content)
        break;

      case 'create':
        this.chatManager.createRoom(content)
        break;

      case 'invite':
        if (!currentRoom) return alert("You must be in a room to invite a user.")
        this.chatManager.inviteUser(currentRoom, content)
        break;

      case 'giphy':
        fetch(`//api.giphy.com/v1/gifs/random?api_key=${GIPHY_TOKEN}&tag=${encodeURIComponent(content)}`)
          .then(async res => {
            const result = await res.json()
            const imageUrl = result.data.fixed_height_downsampled_url
            const message = `![${content}](${imageUrl})`
            this.chatManager.sendMessage(currentRoom, message)
          })
          break;

      default:
        console.log("Unknown command", command)
    }

    this.setState({ newMessage: '' })
  }

  handleInput(event) {
    const { name, value } = event.target

    this.setState({
      [name]: value
    })
  }

  messageKeyDown(event) {
    if (event.keyCode !== 13) return

    event.preventDefault()

    if (event.ctrlKey) {
      // insert newline
      const { newMessage } = this.state
      this.setState({
        newMessage: newMessage + '\n'
      })
    } else {
      this.sendMessage(event)
    }
  }

  switchToRoom(id) {
    const { rooms } = this.state
    const newRoom = rooms.filter(r => r.id == id)[0]

    this.setState(this.updateCurrentRoomState(newRoom))
  }

  render() {
    const {
      userId,
      showLogin,
      rooms,
      currentRoom,
      currentUser,
      messages,
      newMessage,
      roomUsers,
      roomName,
    } = this.state;

    return (
      <div className="App">
        <aside className="sidebar left-sidebar">
        {currentUser ? (
            <div className="user-profile">
              <span className="username">{`@${currentUser}`}</span>
            </div>
          ) : null}
          {rooms ? (
            <RoomList
              rooms={rooms}
              currentRoom={currentRoom}
              switchToRoom={this.switchToRoom.bind(this)}
              currentUser={currentUser}
            />
          ) : null}
        </aside>
        <section className="chat-screen">
          <header className="chat-header">
              {currentRoom ? <h3>{currentRoom.channelName}</h3> : null}
          </header>
          <ul className="chat-messages" id="chat-messages">
            <ChatSession messages={messages} />
          </ul>
          <footer className="chat-footer">
            <fieldset>
              <form className="message-form" autoComplete="off" onSubmit={this.sendMessage}>
                <Textarea
                  minRows={1}
                  maxRows={3}
                  value={newMessage}
                  name="newMessage"
                  className="message-input"
                  placeholder="Type your message and hit ENTER to send"
                  onChange={this.handleInput}
                  onKeyDown={this.messageKeyDown}
                  resize="none"
                />
              </form>
            </fieldset>
          </footer>
        </section>
        <aside className="sidebar right-sidebar">
            {currentRoom ? (
              <RoomUsers
                currentUser={currentUser}
                roomUsers={roomUsers}
              />
            ) : null}
        </aside>
      </div>
    );
  }
}

export default App;