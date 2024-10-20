import express from 'express'
import passport from '../Config/passportConfig.js'
import Routes from './Routes.js'
import UsersControllers from '../Controllers/Users.controllers.js'

export default class UsersRoutes extends Routes {
  constructor () {
    super()
    this.router = express.Router() // Crear un enrutador de Express
    this.controller = new UsersControllers()
    this.getRouter() // Configurar las rutas
  }

  getRouter () {
    this.router
      .get('/profile', passport.authenticate('jwt', { session: false }), this.controller.getProfile)
      .post('/:id', passport.authenticate('jwt', { session: false }), this.controller.updateUser)
    return this.router
  }
}
