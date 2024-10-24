/* eslint-disable camelcase */
import MySql from '../Connections/mysql.js'

export default class AppointmentsDaoMysql {
  constructor () {
    this.db = new MySql()
    this.table = 'appointments'
    this.createTable()
  }

  async createTable () {
    const query = `CREATE TABLE IF NOT EXISTS ${this.table} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_user VARCHAR(36) NOT NULL,
          id_state INT NOT NULL,
          id_van INT,
          day DATE NOT NULL,
          schedule TIME NOT NULL,
          start_address VARCHAR(255) NOT NULL,
          end_address VARCHAR(255) NOT NULL,
          duration TIME NOT NULL,
          cost DECIMAL(10,2) NOT NULL,
          stairs INT NOT NULL,
          distance INT NOT NULL,
          staff BOOLEAN NOT NULL,
          description TEXT NOT NULL,
          FOREIGN KEY (id_van) REFERENCES vans(id) ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY (id_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY (id_state) REFERENCES states(id) ON UPDATE CASCADE
        );`

    // this.connection.query(query)
    await this.db.query(query)
  }

  async addAppointment (appointment) {
    try {
      const {
        id_user,
        day,
        schedule,
        start_address,
        end_address,
        duration,
        cost,
        stairs,
        distance,
        staff,
        description
      } = appointment

      const query = `INSERT INTO appointments 
        (id_user, id_state, id_van, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description)
        VALUES (?, 2, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

      const values = [
        id_user,
        day,
        schedule,
        start_address,
        end_address,
        duration,
        cost,
        stairs,
        distance,
        staff ? 1 : 0,
        description
      ]

      const result = await this.db.query(query, values)
      return result
    } catch (error) {
      console.error('Error adding appointment:', error)
      throw error
    }
  }

  async getAppointmentsByDay (aDay) {
    const query = `
      SELECT a.id, a.id_user, u.first_name, u.last_name, s.state_name, v.driver_name, a.day, a.schedule, a.start_address, a.end_address, a.duration, a.cost, a.stairs, a.distance, a.staff, a.description 
      FROM ${this.table} a
      INNER JOIN users u ON u.id = a.id_user
      INNER JOIN states s ON s.id = a.id_state
      LEFT JOIN vans v ON v.id = a.id_van
      WHERE a.day = ?
      ORDER BY a.schedule ASC;`
    try {
      const rows = await this.db.query(query, [aDay])
      return rows.length > 0 ? rows : null
    } catch (error) {
      console.error('Error fetching appointments by day:', error)
      throw error
    }
  }

  async getAppointmentsByUser (usernameP) {
    const query = `
      SELECT a.id, s.state_name, v.driver_name, a.day, a.schedule, a.start_address, a.end_address, a.duration, a.cost, a.stairs, a.distance, a.staff, a.description 
      FROM ${this.table} a
      INNER JOIN users u ON u.id = a.id_user
      INNER JOIN states s ON s.id = a.id_state
      LEFT JOIN vans v ON v.id = a.id_van
      WHERE u.username = ?;`
    try {
      return await this.db.query(query, [usernameP])
    } catch (error) {
      console.error('Error fetching appointments by username:', error)
      throw error
    }
  }

  async getAvailableTimes (day, timeSlots) {
    try {
      const placeholders = timeSlots.map(() => '?').join(',')
      const query = `
        SELECT schedule, COUNT(*) as total 
        FROM ${this.table} 
        WHERE day = ? AND schedule IN (${placeholders})
        GROUP BY schedule
      `
      const params = [day, ...timeSlots]
      const results = await this.db.query(query, params)
      const countMap = results.reduce((acc, { schedule, total }) => {
        acc[schedule] = total
        return acc
      }, {})
      return timeSlots.filter(hora => (countMap[hora] || 0) < 5)
    } catch (error) {
      console.error('Error in getAvailableTimes:', error)
      throw error
    }
  }

  async updateVanAppointment (idAppointment, idVan) {
    try {
      // Primero obtener la van actual
      const getCurrentVanQuery = 'SELECT id_van FROM appointments WHERE id = ?'
      const [currentVan] = await this.db.query(getCurrentVanQuery, [idAppointment])

      // Luego hacer el update
      const query = 'UPDATE appointments SET id_van = ? WHERE id = ?'
      const result = await this.db.query(query, [idVan, idAppointment])

      // Retornar tanto el resultado como la van anterior
      return {
        result,
        previousVanId: currentVan[0]?.id_van
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  async deleteAppointment (idAppointment) {
    try {
      const query = 'DELETE FROM appointments WHERE id = ?'
      const result = await this.db.query(query, [idAppointment])
      return result
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }
}
