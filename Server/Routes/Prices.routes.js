import express from 'express'
import passport from '../Config/passportConfig.js'
import Routes from './Routes.js'
import PricesControllers from '../Controllers/Prices.controllers.js'

export default class PricesRoutes extends Routes {
  constructor () {
    super()
    this.router = express.Router() // Crear un enrutador de Express
    this.controller = new PricesControllers()
    this.getRouter() // Configurar las rutas
  }

  getRouter () {
    this.router
      .get('/', passport.authenticate('jwt', { session: false }), this.controller.getPrices)
    return this.router
  }
}
