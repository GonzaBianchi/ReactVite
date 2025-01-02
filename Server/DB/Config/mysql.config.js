import dotenv from 'dotenv'

dotenv.config()

const config = {
  host: process.env.HOST_SQL,
  user: process.env.USER_SQL,
  password: process.env.PASSWORD_SQL,
  port: 3306,
  database: process.env.DB_SQL
}

export default config
