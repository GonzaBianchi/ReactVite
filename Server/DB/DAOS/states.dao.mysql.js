import MySql from '../Connections/mysql.js'

export default class StatesDaoMysql extends MySql {
  constructor () {
    super()
    this.table = 'states'
    this.#createTable()
  }

  #createTable () {
    const query =
      `CREATE TABLE IF NOT EXISTS ${this.table} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_name VARCHAR(100) NOT NULL,
      );`

    this.connection.query(query)
  }
}
