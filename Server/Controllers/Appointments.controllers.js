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
      const { day } = req.params
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
}
