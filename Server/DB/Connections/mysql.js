import mysql from 'mysql2'
import config from '../Config/mysql.config.js'

export default class MySql {
  constructor () {
    this.pool = mysql.createPool(config).promise()
  }

  async query (sql, params) {
    const [rows] = await this.pool.execute(sql, params)
    return rows
  }

  async getConnection () {
    return await this.pool.getConnection()
  }
}
