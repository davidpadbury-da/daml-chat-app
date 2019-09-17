export default function ChatManager(party, token, stateUpdate) {
  const headers = {
    Authorization: `Bearer ${token}`
  }
  const chatRoomTemplate = { moduleName: 'Chat', entityName: 'ChatRoom' }

  const get = url => fetch(url, { headers })
  const post = (url, options = {}) => {
    Object.assign(options, { method: 'POST', headers })
    return fetch(url, options)
  }

  const sortMessages = (messages) => {
    messages.sort((m1, m2) => m1.timestamp > m2.timestamp ? 1 : m1.timestamp < m2.timestamp ? -1 : 0)
    return messages
  }

  const sort = (items) => {
    items.sort()
    return items
  }

  const toModel = ({ contractId, argument: { id, owner, channelName, members, messages }}) => ({
    id, contractId, owner, channelName, 
    members: sort(members),
    messages: sortMessages(messages.map(({_1, _2, _3}) => ({
      sender: _1,
      timestamp: new Date(_2),
      text: _3
    })))
  })

  const scheduleNextUpdate = () => setTimeout(fetchUpdate, 500)

  const fetchUpdate = async () => {
    try {
      const response = await post('/contracts/search', { 
        body: JSON.stringify({ '%templates': [ chatRoomTemplate ]})
      })

      const body = await response.json()

      const chatRooms = body.result
        .flatMap(r => r.activeContracts)
        .map(toModel)
      
      chatRooms.sort((r1, r2) => r1.channelName > r2.channelName ? 1 : r1.channelName < r2.channelName ? -1 : 0)
      stateUpdate(chatRooms)
    } catch (e) {
      console.error("Fetching next contracts failed", e)
    } finally {
      scheduleNextUpdate()
    }
  }

  const sendMessage = async (room, message) => {
    await post('/command/exercise', {
      body: JSON.stringify({
        templateId: chatRoomTemplate,
        contractId: room.contractId,
        choice: 'Add',
        argument: {
          winner: party,
          message: message
        }
      })
    })
  }

  const createRoom = async (name) => {
    await post('/command/create', {
      body: JSON.stringify({
        templateId: chatRoomTemplate,
        argument: {
          id: `${party}_${new Date().getTime()}`,
          owner: party,
          channelName: name,
          members: [ party ],
          messages: []
        }
      })
    })
  }

  const inviteUser = async (room, user) => {
    await post('/command/exercise', {
      body: JSON.stringify({
        templateId: chatRoomTemplate,
        contractId: room.contractId,
        choice: 'Invite',
        argument: {
          newMember: user
        }
      })
    })
  }

  // kick off initial update
  fetchUpdate()

  return {
    sendMessage,
    createRoom,
    inviteUser
  }
} 