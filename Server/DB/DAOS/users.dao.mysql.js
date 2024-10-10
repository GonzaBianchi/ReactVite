import MySql from '../Connections/mysql.js'
// import { validateUser } from '../../Models/Users.js'

export default class UsersDaoMysql extends MySql {
  constructor () {
    super()
    this.table = 'users'
    this.#createTable()
  }

  #createTable () {
    const query =
        `CREATE TABLE IF NOT EXISTS ${this.table} (
        id VARCHAR(36) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone BIGINT NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );`

    this.connection.query(query)
  }

  async getUserByUsername (usernameP) {
    const query = `
      SELECT * FROM ${this.table}
      WHERE username = ?;`
    try {
      const [rows] = await this.connection.promise().query(query, [usernameP])
      if (rows.length > 0) {
        return rows[0]
      } else {
        return null
      }
    } catch (error) {
      return 'Error fetching user by username: ' + error
    }
  }

  async addUser (user) {
    try {
      // eslint-disable-next-line camelcase
      const { id, first_name, last_name, phone, email, username, password } = user
      const query = `INSERT INTO ${this.table} (id, first_name, last_name, phone, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`
      // eslint-disable-next-line camelcase
      const [result] = await this.connection.promise().query(query, [id, first_name, last_name, phone, email, username, password])
      return result
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }
}
