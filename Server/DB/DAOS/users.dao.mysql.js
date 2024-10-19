import MySql from '../Connections/mysql.js'
// import { validateUser } from '../../Models/Users.js'

export default class UsersDaoMysql {
  constructor () {
    this.db = new MySql()
    this.table = 'users'
    this.createTable()
  }

  async createTable () {
    const query = `CREATE TABLE IF NOT EXISTS ${this.table} (
      id VARCHAR(36) PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      phone BIGINT NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );`
    await this.db.query(query)
  }

  async getUserByUsername (usernameP) {
    const query = `SELECT * FROM ${this.table} WHERE username = ?;`
    try {
      const rows = await this.db.query(query, [usernameP])
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error('Error fetching user by username:', error)
      throw error
    }
  }

  async addUser (user) {
    try {
      // eslint-disable-next-line camelcase
      const { id, first_name, last_name, phone, email, username, password } = user
      const query = `INSERT INTO ${this.table} (id, first_name, last_name, phone, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`
      // eslint-disable-next-line camelcase
      const result = await this.db.query(query, [id, first_name, last_name, phone, email, username, password])
      return result
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }
}
