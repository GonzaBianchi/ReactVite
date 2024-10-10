import MySql from '../Connections/mysql.js'

export default class PricesDaoMysql extends MySql {
  constructor () {
    super()
    this.table = 'prices'
    this.#createTable()
  }

  #createTable () {
    const query =
      `CREATE TABLE IF NOT EXISTS ${this.table} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0
      );`

    this.connection.query(query)
  }

  async getPrices () {
    const query = `SELECT service_name, price FROM ${this.table} `
    const [result] = await this.connection.promise().query(query)
    return result
  }
}
