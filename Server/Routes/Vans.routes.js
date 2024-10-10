import express from 'express'
import passport from '../Config/passportConfig.js'
import Routes from './Routes.js'
import VansControllers from '../Controllers/Vans.controllers.js'

export default class VansRoutes extends Routes {
  constructor () {
    super()
    this.router = express.Router() // Crear un enrutador de Express
    this.controller = new VansControllers()
    this.getRouter() // Configurar las rutas
  }

  getRouter () {
    this.router
      .post('/', passport.authenticate('jwt', { session: false }), this.controller.addVan)
      .get('/:id', passport.authenticate('jwt', { session: false }), this.controller.deleteVan)
    return this.router
  }
}
