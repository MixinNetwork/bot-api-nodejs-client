import { client, keystore } from './common'

describe('user', () => {
  it('userMe', async () => {
    const user = await client.userMe()
    expect(user.user_id).toEqual(keystore.client_id)
  })

  it('readUser', async () => {
    const user = await client.readUser("30265")
    expect(user.identity_number).toEqual("30265")
  })

  it('readBlockUsers', async () => {
    const user = await client.readBlockUsers()
    expect(Array.isArray(user)).toBeTruthy()
  })

  it('readUsers', async () => {
    const users = await client.readUsers(['e8e8cd79-cd40-4796-8c54-3a13cfe50115'])
    expect(users[0].identity_number).toEqual("30265")
  })

  it('searchUser', async () => {
    // const user1 = await client.searchUser("+8613801380138")
    // expect(user1.identity_number).toEqual("7000")
    const user2 = await client.searchUser("30265")
    expect(user2.identity_number).toEqual("30265")
  })

  it('readFriends', async () => {
    const user = await client.readFriends()
    expect(Array.isArray(user)).toBeTruthy()
  })
})
