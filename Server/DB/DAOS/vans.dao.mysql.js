/* eslint-disable camelcase */
import MySql from '../Connections/mysql.js'

export default class VansDaoMysql {
  constructor () {
    this.db = new MySql()
    this.table = 'vans'
    this.createTable()
  }

  async createTable () {
    const query =
        `CREATE TABLE IF NOT EXISTS ${this.table} (
        id int PRIMARY KEY AUTO_INCREMENT,
        driver_name VARCHAR(255) NOT NULL,
        license_plate VARCHAR(7) NOT NULL UNIQUE,
        model VARCHAR(255) NOT NULL,
        available BOOLEAN DEFAULT TRUE
    );`

    await this.db.query(query)
  }

  async getVans () {
    try {
      const query = `SELECT * FROM ${this.table}`
      const result = await this.db.query(query)
      return result
    } catch (error) {
      console.error('Error fetching vans:', error)
      throw error
    }
  }

  async addVan (van) {
    try {
      const { driver_name, license_plate, model } = van
      const query = `INSERT INTO ${this.table} (driver_name, license_plate, model) VALUES (?, ?, ?)`
      const result = await this.db.query(query, [driver_name, license_plate, model])
      return result
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  async updateVan (idVan, van) {
    try {
      const { driver_name, license_plate, model } = van
      const query = `UPDATE ${this.table} SET driver_name = ?, license_plate = ?, model = ? WHERE id = ?`
      const result = await this.db.query(query, [driver_name, license_plate, model, idVan])
      return result
    } catch (error) {
      console.error('Error updating van:', error)
      throw error
    }
  }

  async updateAvailableVan (idVan) {
    try {
      const query = `UPDATE ${this.table} SET available = NOT available WHERE id = ?`
      const result = await this.db.query(query, [idVan])
      return result
    } catch (error) {
      console.error('Error updating van:', error)
      throw error
    }
  }

  async deleteVan (idVan) {
    try {
      const query = `DELETE FROM ${this.table} WHERE id = ?`
      const result = await this.db.query(query, [idVan])
      return result
    } catch (error) {
      console.error('Error deleting van:', error)
      throw error
    }
  }
}
