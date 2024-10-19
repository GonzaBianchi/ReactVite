import passport from 'passport'
import { Strategy as JwtStrategy } from 'passport-jwt'
import UsersDaoMysql from '../DB/DAOS/users.dao.mysql.js'
import dotenv from 'dotenv'

dotenv.config()

const db = new UsersDaoMysql()

const cookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies.access_token
  }
  // console.log('Token extraído:', token) // Log para depuración
  return token
}

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRETKEY
}

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  try {
    // console.log('Payload JWT:', jwtPayload) // Log para depuración

    // Verificar si es el usuario admin
    if (jwtPayload.username === process.env.ADMIN_USER) {
      // console.log('Autenticación de admin')
      return done(null, {
        username: process.env.ADMIN_USER,
        role: 'admin'
      })
    }

    // Si no es admin, buscar en la base de datos
    const user = await db.getUserByUsername(jwtPayload.username)
    if (user) {
      // console.log('Usuario autenticado:', user.username)
      return done(null, user)
    } else {
      console.log('Usuario no encontrado')
      return done(null, false)
    }
  } catch (error) {
    console.error('Error en la autenticación:', error)
    return done(error, false)
  }
}))

export default passport
