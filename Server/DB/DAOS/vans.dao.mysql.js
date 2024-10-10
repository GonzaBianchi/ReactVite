import MySql from '../Connections/mysql.js'

export default class VansDaoMysql extends MySql {
  constructor () {
    super()
    this.table = 'vans'
    this.#createTable()
  }

  #createTable () {
    const query =
        `CREATE TABLE IF NOT EXISTS ${this.table} (
        id int PRIMARY KEY AUTO_INCREMENT,
        driver_name VARCHAR(255) NOT NULL,
        license_plate VARCHAR(7) NOT NULL UNIQUE,
        model VARCHAR(255) NOT NULL,
    );`

    this.connection.query(query)
  }

  async addVan (van) {
    try {
      // eslint-disable-next-line camelcase
      const { driver_name, license_plate, model } = van
      const query = `INSERT INTO ${this.table} (driver_name, license_plate, model) VALUES (?, ?, ?)`
      // eslint-disable-next-line camelcase
      const [result] = await this.connection.promise().query(query, [driver_name, license_plate, model])
      return result
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  async deleteVan (idVan) {
    const query = `DELETE FROM ${this.table} WHERE id = ?`
    const [result] = await this.connection.promise().query(query, [idVan])
    return result
  }
}
