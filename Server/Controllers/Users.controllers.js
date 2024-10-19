import UsersDaoMysql from '../DB/DAOS/users.dao.mysql.js'
import UsersHelpers from '../Helpers/User.helper.js'
// import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

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
      delete userProfile.password
      return res.status(200).json(userProfile)
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // updateUser = async (req, res) => {
  //   const userId = req.params.id
  //   const { firstName, lastName, phone, email, password, password2, age } = req.body
  //   // Crear objeto con los datos a actualizar
  //   const userData = {}
  //   // Actualizar userData con los campos proporcionados
  //   if (firstName) userData.firstName = firstName
  //   if (lastName) userData.lastName = lastName
  //   if (phone) userData.phone = phone
  //   if (email) userData.email = email
  //   if (password.trim() !== '' && password2.trim() !== '') {
  //     if (password !== password2) {
  //       return res.status(400).json({ error: 'Las contraseñas no coinciden' })
  //     } else {
  //       const hash = bcrypt.hashSync(password, 10)
  //       userData.password = hash
  //     }
  //   }

  //   if (age) userData.age = age
  //   try {
  //     const result = await this.db.updateUser(userId, userData)
  //     if (result.affectedRows === 0) {
  //       return res.status(404).json({ error: 'Usuario no encontrado' })
  //     }
  //     res.json({ message: 'Usuario actualizado con éxito' })
  //   } catch (error) {
  //     console.error('Error al actualizar el usuario:', error)
  //     res.status(500).json({ error: 'Error al actualizar el usuario' })
  //   }
  // }
}
