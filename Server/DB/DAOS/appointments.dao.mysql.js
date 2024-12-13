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
          is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
          elevator BOOLEAN DEFAULT FALSE,
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
        description,
        elevator
      } = appointment

      const query = `INSERT INTO appointments 
        (id_user, id_state, id_van, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description, elevator)
        VALUES (?, 2, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

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
        description,
        elevator ? 1 : 0
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
      SELECT a.id, a.id_user, u.first_name, u.last_name, s.state_name, v.driver_name, a.day, a.schedule, a.start_address, a.end_address, a.duration, a.cost, a.stairs, a.distance, a.staff, a.description, a.elevator 
      FROM ${this.table} a
      INNER JOIN users u ON u.id = a.id_user
      INNER JOIN states s ON s.id = a.id_state
      LEFT JOIN vans v ON v.id = a.id_van
      WHERE a.day = ? AND a.is_deleted = FALSE
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
      SELECT a.id, s.state_name, v.driver_name, a.day, a.schedule, a.start_address, a.end_address, a.duration, a.cost, a.stairs, a.distance, a.staff, a.description, a.elevator 
      FROM ${this.table} a
      INNER JOIN users u ON u.id = a.id_user
      INNER JOIN states s ON s.id = a.id_state
      LEFT JOIN vans v ON v.id = a.id_van
      WHERE u.username = ? AND a.is_deleted = FALSE AND a.day >= NOW()
      ORDER BY a.day, a.schedule ASC;`
    try {
      return await this.db.query(query, [usernameP])
    } catch (error) {
      console.error('Error fetching appointments by username:', error)
      throw error
    }
  }

  async getAvailableTimes (day, timeSlots) {
    try {
      console.log('Executing getAvailableTimes:', { day, timeSlots })

      const placeholders = timeSlots.map(() => '?').join(',')
      const query = `
        SELECT schedule, COUNT(*) as total
        FROM ${this.table}
        WHERE day = ? AND schedule IN (${placeholders}) AND is_deleted = FALSE
        GROUP BY schedule
      `
      const params = [day, ...timeSlots]

      console.log('SQL query:', query)
      console.log('SQL params:', params)

      const results = await this.db.query(query, params)
      console.log('SQL results:', results)

      const countMap = results.reduce((acc, { schedule, total }) => {
        const normalizedSchedule = schedule.slice(0, 5) // '10:00:00' -> '10:00'
        console.log(`Processing schedule: ${normalizedSchedule} - total: ${total}`)
        acc[normalizedSchedule] = total
        return acc
      }, {})
      console.log('Count map:', countMap)

      const availableTimes = timeSlots.filter(hora => (countMap[hora] || 0) < 5)

      console.log('Available times:', availableTimes)

      return availableTimes
    } catch (error) {
      console.error('Error in getAvailableTimes:', error)
      throw error
    }
  }

  async updateVanAppointment (idAppointment, idVan) {
    try {
      const query = 'UPDATE appointments SET id_van = ?, id_state = 2 WHERE id = ?'
      const result = await this.db.query(query, [idVan, idAppointment])

      // Retornar tanto el resultado como la van anterior
      return {
        result
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  async updateAppointment (appointmentId, updatedData) {
    try {
      const query = `UPDATE appointments 
        SET day = ?, schedule = ?, start_address = ?, end_address = ?, 
        duration = ?, cost = ?, stairs = ?, distance = ?, staff = ?, description = ?, elevator = ?
        WHERE id = ?`

      const values = [
        updatedData.day,
        updatedData.schedule,
        updatedData.start_address,
        updatedData.end_address,
        updatedData.duration,
        updatedData.cost,
        updatedData.stairs,
        updatedData.distance,
        updatedData.staff ? 1 : 0,
        updatedData.description,
        updatedData.elevator ? 1 : 0,
        appointmentId
      ]

      const result = await this.db.query(query, values)
      return result
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  async checkAppointmentEditEligibility (appointmentId, username) {
    const query = `
      SELECT day, schedule 
      FROM appointments a
      JOIN users u ON a.id_user = u.id
      WHERE a.id = ? AND u.username = ? AND a.is_deleted = FALSE
    `
    try {
      const [appointment] = await this.db.query(query, [appointmentId, username])

      if (!appointment) {
        return { eligible: false, reason: 'Turno no encontrado' }
      }

      const appointmentDateTime = new Date(`${appointment.day} ${appointment.schedule}`)
      const now = new Date()
      const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60)

      if (hoursDifference <= 48) {
        return {
          eligible: false,
          reason: 'No es posible modificar el turno. Debe hacerse con al menos 48 horas de anticipación.'
        }
      }

      return { eligible: true }
    } catch (error) {
      console.error('Error checking appointment eligibility:', error)
      throw error
    }
  }

  async deleteAppointment (idAppointment) {
    try {
      const query = 'UPDATE appointments SET is_deleted = TRUE WHERE id = ?'
      const result = await this.db.query(query, [idAppointment])
      return result
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }
}
