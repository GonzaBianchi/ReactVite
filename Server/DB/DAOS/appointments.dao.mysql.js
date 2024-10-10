import MySql from '../Connections/mysql.js'

export default class AppointmentsDaoMysql extends MySql {
  constructor () {
    super()
    this.table = 'appointments'
    this.#createTable()
  }

  #createTable () {
    const query =
        `CREATE TABLE IF NOT EXISTS ${this.table} (
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

    this.connection.query(query)
  }

  async addAppointment (appointment) {
    try {
      // eslint-disable-next-line camelcase
      const { username, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description } = appointment

      const query = `INSERT INTO appointments (id_user, id_state, id_van, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description)
      VALUES ((SELECT id FROM users WHERE username = ?),2,NULL,?,?,?,?,?,?,?,?,?,?)`

      // eslint-disable-next-line camelcase
      const [result] = await this.connection.promise().query(query, [username, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description])
      return result
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  async getAppointmentsByDay (aDay) {
    const query = `
      SELECT u.first_name, u.last_name, s.state_name, v.driver_name, a.day, a.schedule, a.start_address, a.end_address, a.duration, a.cost, a.stairs, a.distance, a.staff, a.description FROM ${this.table} a
      INNER JOIN users u ON u.id = a.id_user
      INNER JOIN states s ON s.id = a.id_state
      INNER JOIN vans v ON v.id = a.id_van
      WHERE day = ?;`
    try {
      const [rows] = await this.connection.promise().query(query, [aDay])
      if (rows.length > 0) {
        return rows
      } else {
        return null
      }
    } catch (error) {
      return 'Error fetching user by username: ' + error
    }
  }

  async getAppointmentsByUser (usernameP) {
    const query = `
      SELECT s.state_name, v.driver_name, a.day, a.schedule, a.start_address, a.end_address, a.duration, a.cost, a.stairs, a.distance, a.staff, a.description FROM ${this.table} a
      INNER JOIN users u ON u.id = a.id_user
      INNER JOIN states s ON s.id = a.id_state
      INNER JOIN vans v ON v.id = a.id_van
      WHERE username = ?;`
    try {
      const [rows] = await this.connection.promise().query(query, [usernameP])
      if (rows.length > 0) {
        return rows
      } else {
        return null
      }
    } catch (error) {
      return 'Error fetching user by username: ' + error
    }
  }

  async getAvailableTimes (day, timeSlots) {
    const availableTimes = []

    for (const hora of timeSlots) {
      const [result] = await this.db.query(
        `SELECT COUNT(*) as total FROM ${this.table} WHERE day = ? AND schedule = ?`,
        [day, hora]
      )

      if (result.total < 5) {
        availableTimes.push(hora)
      }
    }

    return availableTimes
  }
}
