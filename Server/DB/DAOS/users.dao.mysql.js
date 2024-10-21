/* eslint-disable camelcase */
import MySql from '../Connections/mysql.js'

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

  async getUserIdByUsername (usernameP) {
    const query = `SELECT id FROM ${this.table} WHERE username = ?;`
    try {
      const rows = await this.db.query(query, [usernameP])
      return rows.length > 0 ? rows[0].id : null
    } catch (error) {
      console.error('Error fetching user id by username:', error)
      throw error
    }
  }

  async addUser (user) {
    try {
      const { id, first_name, last_name, phone, email, username, password } = user
      const query = `INSERT INTO ${this.table} (id, first_name, last_name, phone, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)`
      const result = await this.db.query(query, [id, first_name, last_name, phone, email, username, password])
      return result
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  async updateUser (id, user) {
    try {
      if (!user.password || user.password.trim() === '') {
        const { first_name, last_name, phone, email, username } = user
        const query = `UPDATE ${this.table} SET first_name = ?, last_name = ?, phone = ?, email = ?, username = ? WHERE id = ?`
        const result = await this.db.query(query, [first_name, last_name, phone, email, username, id])
        return result
      }
      const { first_name, last_name, phone, email, username, password } = user
      const query = `UPDATE ${this.table} SET first_name = ?, last_name = ?, phone = ?, email = ?, username = ?, password = ? WHERE id = ?`
      const result = await this.db.query(query, [first_name, last_name, phone, email, username, password, id])
      return result
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }
}
