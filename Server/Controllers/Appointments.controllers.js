/* eslint-disable camelcase */
import AppointmentsDaoMysql from '../DB/DAOS/appointments.dao.mysql.js'
import AppointmentsHelpers from '../Helpers/Appointment.helper.js'
import UsersDaoMysql from '../DB/DAOS/users.dao.mysql.js'
import VansDaoMysql from '../DB/DAOS/vans.dao.mysql.js'
import { validateAppointment } from '../Schemas/AppointmentSchema.js'
import dotenv from 'dotenv'

dotenv.config()

export default class AppointmentsControllers {
  constructor () {
    this.db = new AppointmentsDaoMysql()
    this.usersDb = new UsersDaoMysql()
    this.vansDb = new VansDaoMysql()
    this.appointmentHelpers = new AppointmentsHelpers()
  }

  addAppointment = async (req, res) => {
    try {
      // Validar las direcciones usando el schema de Zod
      const validationResult = validateAppointment(req.body)
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Datos de dirección inválidos', details: validationResult.error.errors })
      }

      const userId = await this.usersDb.getUserIdByUsername(req.body.username)

      // Ajustar el formato de duración
      const duration = req.body.duration + ':00' // Añadir segundos si no están presentes

      const newAppointment = {
        id_user: userId,
        ...req.body,
        duration
      }

      const appointment = this.appointmentHelpers.parseAppointment(newAppointment)
      console.log('Parsed appointment:', appointment)
      const result = await this.db.addAppointment(appointment)
      res.status(201).json(result)
    } catch (error) {
      console.error('Error adding appointment:', error)
      res.status(500).json({ error: 'Error interno del servidor', details: error.message })
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

  updateVanAppointment = async (req, res) => {
    try {
      const { id } = req.params
      const { id_van } = req.body

      // Actualizar appointment y obtener van anterior
      const { result, previousVanId } = await this.db.updateVanAppointment(id, id_van)

      if (result.affectedRows > 0) {
        // Si había una van anterior, marcarla como available
        if (previousVanId) {
          await this.vansDb.updateVanAvailability(previousVanId, true)
        }

        // Marcar la nueva van como unavailable
        await this.vansDb.updateVanAvailability(id_van, false)

        return res.status(200).json({
          message: 'Turno actualizado correctamente',
          result
        })
      } else {
        return res.status(404).json({
          error: 'No se encontró el turno para actualizar'
        })
      }
    } catch (error) {
      console.error('Error al actualizar el turno:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  updateAppointment = async (req, res) => {
    try {
      const { id } = req.params
      const user = req.user

      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' })
      }

      console.log('Datos del formulario:', req.body)
      // Validar los datos de entrada usando el mismo esquema de Zod
      const validationResult = validateAppointment(req.body)
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Datos de dirección inválidos', details: validationResult.error.errors })
      }

      // Verificar elegibilidad para editar el turno
      const eligibilityCheck = await this.db.checkAppointmentEditEligibility(id, user.username)

      if (!eligibilityCheck.eligible) {
        return res.status(400).json({ error: eligibilityCheck.reason })
      }

      // Ajustar el formato de duración
      const duration = req.body.duration + ':00'

      const updatedAppointment = {
        ...req.body,
        duration
      }

      const result = await this.db.updateAppointment(id, updatedAppointment)

      if (result.affectedRows > 0) {
        res.status(200).json({
          message: 'Turno actualizado exitosamente',
          result
        })
      } else {
        res.status(404).json({ error: 'Turno no encontrado' })
      }
    } catch (error) {
      console.error('Error al actualizar el turno:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  deleteAppointment = async (req, res) => {
    try {
      const appointmentId = req.params.id
      const result = await this.db.deleteAppointment(appointmentId)
      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Turno eliminado exitosamente' })
      } else {
        res.status(404).json({ success: false, message: 'Turno no encontrado' })
      }
    } catch (error) {
      console.error('Error al eliminar el turno:', error)
      res.status(500).json({ success: false, error: 'Error interno del servidor' })
    }
  }

  deleteAppointmentAdmin = async (req, res) => {
    try {
      const appointmentId = req.params.id
      const idUser = req.body.id_user

      // Primero obtener la info del usuario
      const userInfor = await this.usersDb.getUserInfo(idUser)

      // Luego eliminar el appointment
      await this.db.deleteAppointment(appointmentId)

      // Devolver la info del usuario
      res.status(200).json({
        message: 'Turno cancelado exitosamente',
        userInfo: userInfor
      })
    } catch (error) {
      console.error('Error al cancelar el turno:', error)
      res.status(500).json({ error: 'Error al cancelar el turno' })
    }
  }
}
