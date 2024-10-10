// passportConfig.js
import passport from 'passport'
import { Strategy as JwtStrategy } from 'passport-jwt'
import UsersDaoMysql from '../DB/DAOS/users.dao.mysql.js'

const db = new UsersDaoMysql()

const cookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies.access_token
  }
  return token
}

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRETKEY // Debe ser la misma clave secreta segura
}

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  try {
    const user = await db.getUserByUsername(jwtPayload.username)
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error, false)
  }
}))

export default passport
