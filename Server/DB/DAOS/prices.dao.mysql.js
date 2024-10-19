import MySql from '../Connections/mysql.js'

export default class PricesDaoMysql {
  constructor () {
    this.db = new MySql()
    this.table = 'prices'
    this.createTable()
  }

  async createTable () {
    const query =
      `CREATE TABLE IF NOT EXISTS ${this.table} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0
      );`

    await this.db.query(query)
  }

  async getPrices () {
    const query = `SELECT * FROM ${this.table}`
    const result = await this.db.query(query)
    return result
  }

  async updatePrice (id, serviceName, price) {
    const query = `UPDATE ${this.table} SET price = ?, service_name = ? WHERE id = ?`
    const result = await this.db.query(query, [price, serviceName, id])
    return result
  }
}
