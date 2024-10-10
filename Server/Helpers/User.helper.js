import User from '../Models/Users.js'

export default class UsersHelpers {
  parseUser (data) {
    // eslint-disable-next-line camelcase
    const { first_name, last_name, phone, email, username, password } = data
    const user = new User(first_name, last_name, parseInt(phone), email, username, password)

    return user
  }
}
