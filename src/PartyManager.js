export default function PartyManager(stateUpdate) {

  const fetchUpdate = async () => {
    try {
      const response = await fetch('/parties')

      if (response.status !== 200) {
        console.error('Parties request failed', response)
        throw new Error('Parties response failed')
      }

      const json = await response.json()

      stateUpdate(toModel(json.result))
    } finally {
      scheduleNextUpdate()
    }
  }

  const sortParties = parties => {
    parties.sort(
      (p1, p2) => p1.displayName > p2.displayName ? 1 : p1.displayName < p2.displayName ? -1 : 0
    )
    return parties
  }
  const toModel = resp => sortParties(resp)

  const scheduleNextUpdate = () => setTimeout(fetchUpdate, 3000)

  fetchUpdate()

  return {}
}