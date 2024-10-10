import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import UsersDaoMysql from '../DB/DAOS/users.dao.mysql.js'
import { validateUser, validateUserLogin } from '../Config/usersConfig.js'
import { ROLES } from '../Config/config.js'
import UsersHelpers from '../Helpers/User.helper.js'
import dotenv from 'dotenv'

dotenv.config()

export default class SessionControllers {
  constructor () {
    this.db = new UsersDaoMysql()
    this.refreshTokens = new Map()
    this.usersHelpers = new UsersHelpers()
  }

  register = async (req, res) => {
    const user = this.usersHelpers.parseUser(req.body)
    console.log(user)
    const result = validateUser(user)

    if (result.error) {
      return res.status(400).json({ error: result.error.message })
    }

    const { username, password } = result.data

    try {
      const existingUser = await this.db.getUserByUsername(username)

      if (existingUser || username === process.env.ADMIN_USER) return res.status(409).json({ error: 'El usuario ya se encuentra registrado' })

      const id = randomUUID()
      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = {
        id,
        ...result.data,
        password: hashedPassword
      }

      console.log(newUser)

      const saveResult = await this.db.addUser(newUser)

      return res.status(201).json({ message: 'Usuario registrado correctamente: ', saveResult })
    } catch (error) {
      console.error('Error al registrar el nuevo usuario: ', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  login = async (req, res) => {
    const result = validateUserLogin(req.body)

    console.log(result)

    if (result.error) {
      return res.status(400).json({ error: result.error.message })
    }

    const { username, password } = result.data
    console.log(username, password, process.env.ADMIN_USER, process.env.ADMIN_PW)
    try {
      if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PW) {
        const token = this.generateAccessToken({ username, role: ROLES.ADMIN })
        const refreshToken = this.generateRefreshToken({ username, role: ROLES.ADMIN })

        this.refreshTokens.set(refreshToken, username)

        res.cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600000
        })

        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 3600000 // 7 días
        })

        return res.status(200).json({ message: 'Inicio de sesión exitoso como administrador', role: ROLES.ADMIN })
      }

      const user = await this.db.getUserByUsername(username)
      if (!user) throw new Error('El usuario no existe')

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) throw new Error('Contraseña invalida, intente nuevamente')

      const token = this.generateAccessToken({ username: user.username, id: user.id, role: ROLES.USER })
      const refreshToken = this.generateRefreshToken({ username: user.username, id: user.id, role: ROLES.USER })

      this.refreshTokens.set(refreshToken, username)

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      })

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 3600000 // 7 días
      })

      return res.status(200).json({ message: 'Inicio de sesión exitoso', role: ROLES.USER, username: user.username })
    } catch (error) {
      console.error('Error al iniciar sesion: ', error)
      return res.status(500).json({ error: 'Error interno en el servidor' })
    }
  }

  getRole = async (req, res) => {
    const token = req.cookies.access_token
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETKEY)
      return res.status(200).json({ role: decoded.role, username: decoded.username })
    } catch (err) {
      return res.status(403).json({ message: 'Token no válido' })
    }
  }

  refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token

    if (!refreshToken || !this.refreshTokens.has(refreshToken)) {
      return this.autoLogout(res)
    }

    try {
      const userData = jwt.verify(refreshToken, process.env.JWT_REFESH_SECETKEY)
      const newAccessToken = this.generateAccessToken({ username: userData.username, id: userData.id, role: userData.role })

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      })

      return res.status(200).json({ message: 'Token refrescado exitosamente' })
    } catch (error) {
      console.error('Error al refrescar token: ', error)
      return res.status(403).json({ error: 'Refresh token inválido' })
    }
  }

  autoLogout = (res) => {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res.status(403).json({ message: 'Sesión expirada. Por favor, inicie sesión nuevamente.' })
  }

  logout = async (req, res) => {
    const refreshToken = req.cookies.refresh_token

    this.refreshTokens.delete(refreshToken)

    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    return res.status(200).json({ message: 'Logout successful' })
  }

  generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRETKEY, { expiresIn: '1h' })
  }

  generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_REFESH_SECETKEY, { expiresIn: '7d' })
  }
}
