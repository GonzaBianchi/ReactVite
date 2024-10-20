/* eslint-disable camelcase */
import UsersDaoMysql from '../DB/DAOS/users.dao.mysql.js'
import UsersHelpers from '../Helpers/User.helper.js'
// import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { validateUser, validateUserUpdate } from '../Schemas/UserSchema.js'
import bcrypt from 'bcrypt'

dotenv.config()

export default class UsersControllers {
  constructor () {
    this.db = new UsersDaoMysql()
    this.userHelpers = new UsersHelpers()
  }

  addUser = async (req, res) => {
    try {
      const user = this.userHelpers.parseUser(req.body)
      const result = await this.db.addUser(user)
      res.status(201).json(result)
    } catch (error) {
      console.error('Error adding user:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  getProfile = async (req, res) => {
    try {
      const user = req.user
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }
      const userProfile = await this.db.getUserByUsername(user.username)
      if (!userProfile) {
        return res.status(404).json({ error: 'Perfil de usuario no encontrado' })
      }
      // Eliminar la contraseña del perfil antes de enviarlo
      // delete userProfile.password
      console.log(userProfile)
      return res.status(200).json(userProfile)
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  updateUser = async (req, res) => {
    const user = this.userHelpers.parseUser(req.body)
    const userId = req.params.id

    if (!user.password || user.password.trim() === '') {
      const result = validateUserUpdate(user)

      if (result.error) {
        return res.status(400).json({ error: result.error.issues })
      }

      const { first_name, last_name, phone, email, username } = result.data

      const updatedUser = {
        first_name,
        last_name,
        phone,
        email,
        username
      }

      try {
        const saveResult = await this.db.updateUser(userId, updatedUser)
        console.log(saveResult)
        return res.status(200).json({ message: 'Usuario actualizado correctamente', saveResult })
      } catch (error) {
        console.error('Error al actualizar el usuario:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
      }
    }

    const result = validateUser(user)

    if (result.error) {
      return res.status(400).json({ error: result.error.issues })
    }

    const { password } = result.data

    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = {
      ...result.data,
      password: hashedPassword
    }

    try {
      const saveResult = await this.db.updateUser(userId, updatedUser)
      console.log(saveResult)
      return res.status(200).json({ message: 'Usuario actualizado correctamente', saveResult })
    } catch (error) {
      console.error('Error al actualizar el usuario:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
