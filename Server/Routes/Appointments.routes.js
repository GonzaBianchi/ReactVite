import express from 'express'
import passport from '../Config/passportConfig.js'
import Routes from './Routes.js'
import AppointmentsControllers from '../Controllers/Appointments.controllers.js'

export default class AppointmentsRoutes extends Routes {
  constructor () {
    super()
    this.router = express.Router() // Crear un enrutador de Express
    this.controller = new AppointmentsControllers()
    this.getRouter() // Configurar las rutas
  }

  getRouter () {
    this.router
      .post('/', passport.authenticate('jwt', { session: false }), this.controller.addAppointment)
      .get('/day/:day', passport.authenticate('jwt', { session: false }), this.controller.getAppointmentsByDay)
      .get('/user/:username', passport.authenticate('jwt', { session: false }), this.controller.getAppointmentsByUser)
      .get('/available-times/:day', passport.authenticate('jwt', { session: false }), this.controller.getAvailableTimes)
      .put('/:id', passport.authenticate('jwt', { session: false }), this.controller.updateVanAppointment)
      .put('/appointmentUser/:id', passport.authenticate('jwt', { session: false }), this.controller.updateAppointment)
      .put('/user/:id', passport.authenticate('jwt', { session: false }), this.controller.deleteAppointment)
      .put('/admin/:id', passport.authenticate('jwt', { session: false }), this.controller.deleteAppointmentAdmin)
    return this.router
  }
}
