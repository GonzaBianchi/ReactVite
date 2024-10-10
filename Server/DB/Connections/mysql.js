import mysql from 'mysql2'
import config from '../Config/mysql.config.js'

export default class MySql {
  constructor () {
    this.connection = mysql.createConnection(config)
    this.connection.connect(err =>
      err ? console.error('No se pudo conectar con la db') : console.log('Conectado a la db'))
  }
}
