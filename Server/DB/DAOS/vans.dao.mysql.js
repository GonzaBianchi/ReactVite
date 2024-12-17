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

  async getAvailableVans (date, schedule) {
    try {
      const utcDate = new Date(date)
      const formattedDate = utcDate.toISOString().split('T')[0]

      const query = `
        SELECT DISTINCT v.*
        FROM vans v
        LEFT JOIN appointments a ON v.id = a.id_van
          AND DATE(a.day) = ?
          AND a.is_deleted = FALSE
          AND (
            (
              a.schedule <= ?
              AND ADDTIME(ADDTIME(a.schedule, a.duration), '01:00:00') > ?
            )
            OR
            (
              ? <= ADDTIME(ADDTIME(a.schedule, a.duration), '01:00:00')
              AND ? >= a.schedule
            )
          )
        WHERE 
          v.available = TRUE 
          AND a.id IS NULL
        ORDER BY v.id;
      `

      const result = await this.db.query(query, [
        formattedDate,
        schedule,
        schedule,
        schedule,
        schedule
      ])

      return result
    } catch (error) {
      console.error('Error fetching available vans:', error)
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

  async checkVanHasFutureAppointments (vanId) {
    try {
      const query = `
        SELECT COUNT(*) as appointmentCount
        FROM appointments 
        WHERE id_van = ?
        AND day >= CURDATE()
        AND is_deleted = FALSE
      `
      const [result] = await this.db.query(query, [vanId])
      return result.appointmentCount > 0
    } catch (error) {
      console.error('Error checking van appointments:', error)
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

  async updateVanAvailability (idVan, available) {
    try {
      const query = `UPDATE ${this.table} SET available = ? WHERE id = ?`
      const result = await this.db.query(query, [available, idVan])
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
