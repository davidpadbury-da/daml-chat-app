import React, { Component } from 'react'
import { onChange } from './utils'
import ChatManager from './ChatManager'
import RoomList from './components/RoomList';
import ChatSession from './components/ChatSession';
import RoomUsers from './components/RoomUsers'
import Dialog from './components/Dialog'
import { animateScroll } from 'react-scroll'
import queryString from 'query-string'
import Textarea from 'react-textarea-autosize'
import rsaSign from 'jsrsasign'
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";

import 'skeleton-css/css/normalize.css'
import 'skeleton-css/css/skeleton.css'
import './App.css';
import PartyManager from './PartyManager';
import "@webscopeio/react-textarea-autocomplete/style.css";

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

// const secret = sssshhhh || prompt("What is your secret?")
// const token = generateToken(party, ledgerId, secret)
const GIPHY_TOKEN = 'kDqbzOZtPvy38TLdqonPnpTPrsLfW8uy'

const Loading = ({ data }) => <div>Loading</div>
const PartyAutoCompleteItem = ({ entity }) => <div>{`️👤 ${entity.displayName}`}</div>
const params = queryString.parse(window.location.search)
const ledgerId = params.ledgerId || 'chatroom'

class App extends Component {
  constructor() {
    super();
    this.state = {
      userId: '',
      secret: '',
      currentUser: null,
      currentRoom: null,
      rooms: null,
      roomUsers: [],
      roomName: null,
      messages: [],
      newMessage: '',
      parties: []
    };

    this.handleInput = this.handleInput.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.updateCurrentRoomState = this.updateCurrentRoomState.bind(this)
    this.messageKeyDown = this.messageKeyDown.bind(this)
    this.login = this.login.bind(this)

    this.partyManager = new PartyManager(onChange(parties => {
      console.log('new parties', parties)
      this.setState({ parties })
    }))
  }

  login(event) {
    const { userId, secret } = this.state
    event.preventDefault()
    this.createChatManager(userId, secret)
  }

  async createChatManager(party, secret) {
    const token = generateToken(party, ledgerId, secret)
    
    try {
      this.chatManager = await ChatManager(party, token, onChange(rooms => {
        const { currentRoom } = this.state

        const newRoom = currentRoom && rooms.filter(r => r.id === currentRoom.id)[0] || rooms[0]

        this.setState({
          userId: party,
          currentUser: party,
          rooms: rooms,
          ...this.updateCurrentRoomState(newRoom)
        })
      }))
    } catch (ex) {
      alert(ex.message || 'Unable to connect to chat')
    }
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

  updateUserId(userId) {
    this.setState({ userId })
  }

  sendMessage(event) {
    event.preventDefault()
    const { newMessage, currentUser, currentRoom } = this.state

    if (newMessage.trim() === '') return

    const match = /\/(\w+) (.*)/.exec(newMessage)
    const command = match ? match[1] : (newMessage === '/parties' ? 'parties' : 'send')
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
        this.chatManager.inviteUser(currentRoom, content.trim())
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

      case 'parties':
        const message = this.state.parties.map(x => x.partyId).join("\n")
        this.setState({
          messages: this.state.messages.concat({timestamp: new Date(), sender: 'Known Parties', text: message })
        })
        console.log("showing parties")
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
    const newRoom = rooms.filter(r => r.id === id)[0]

    this.setState(this.updateCurrentRoomState(newRoom))
  }

  render() {
    const {
      userId,
      secret,
      rooms,
      currentRoom,
      currentUser,
      messages,
      newMessage,
      roomUsers,
      roomName,
      parties
    } = this.state;

    return (
      <div className="App">
        <aside className="sidebar left-sidebar">
        {currentUser ? (
            <div className="user-profile">
              <span className="username">{`@${parties[currentUser]}`}</span>
            </div>
          ) : null}
          {!!rooms ? (
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
            <ChatSession messages={messages} parties={parties} />
          </ul>
          <footer className="chat-footer">
            <fieldset>
              <form className="message-form" autoComplete="off" onSubmit={this.sendMessage}>
                <ReactTextareaAutocomplete
                  className="message-input"
                  value={newMessage}
                  name="newMessage"
                  className="message-input"
                  placeholder="Type your message and hit ENTER to send"
                  onChange={this.handleInput}
                  onKeyDown={this.messageKeyDown}
                  trigger={{
                    "@": {
                      dataProvider: token => {
                        return parties
                          .filter(p => p.displayName.toLowerCase().includes(token.toLowerCase()))
                          .slice(0, 10)
                          .map(p => ({ displayName: p.displayName, partyId: p.partyId }))
                      },
                      component: PartyAutoCompleteItem,
                      output: (item, trigger) => item.partyId
                    }
                  }}
                  loadingComponent={Loading}
                  resize="none" />
              </form>
            </fieldset>
          </footer>
        </section>
        <aside className="sidebar right-sidebar">
            {!currentUser ? (
              <Dialog 
                userId={userId}
                handleInput={this.handleInput}
                login={this.login}
                secret={this.secret}
                parties={parties}
                updateUserId={this.updateUserId.bind(this)} />
            ) : null}
            {!!currentRoom ? (
              <RoomUsers
                currentUser={currentUser}
                roomUsers={roomUsers}
                parties={parties}
              />
            ) : null}
        </aside>
      </div>
    );
  }
}

export default App;
