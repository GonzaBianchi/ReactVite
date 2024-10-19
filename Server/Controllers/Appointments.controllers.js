import AppointmentsDaoMysql from '../DB/DAOS/appointments.dao.mysql.js'
import AppointmentsHelpers from '../Helpers/Appointment.helper.js'
import dotenv from 'dotenv'

dotenv.config()

export default class AppointmentsControllers {
  constructor () {
    this.db = new AppointmentsDaoMysql()
    this.appointmentHelpers = new AppointmentsHelpers()
  }

  addAppointment = async (req, res) => {
    try {
      const appointment = this.appointmentHelpers.parseAppointment(req.body)
      const result = await this.db.addAppointment(appointment)
      res.status(201).json(result)
    } catch (error) {
      console.error('Error adding appointment:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  getAppointmentsByDay = async (req, res) => {
    try {
      const { day } = req.params
      if (!day) return res.status(400).json({ error: 'Día no proporcionado' })
      const appointments = await this.db.getAppointmentsByDay(day)
      if (!appointments) {
        return res.status(404).json({ error: 'No se encontraron turnos para ese día' })
      }
      return res.status(200).json(appointments)
    } catch (error) {
      console.error('Error al obtener turnos:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  getAppointmentsByUser = async (req, res) => {
    try {
      const user = req.user
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }
      const userAppointments = await this.db.getAppointmentsByUser(user.username)
      return res.status(200).json({ appointments: userAppointments })
    } catch (error) {
      console.error('Error al obtener turnos del usuario:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  getAvailableTimes = async (req, res) => {
    try {
      const { day } = req.query
      if (!day) {
        return res.status(400).json({ error: 'La fecha es requerida' })
      }
      const schedule = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
      const availableTimes = await this.db.getAvailableTimes(day, schedule)
      return res.status(200).json({ availableTimes })
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error)
      return res.status(500).json({ error: 'Error al obtener los horarios disponibles' })
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
