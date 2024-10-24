import express from 'express'
import Routes from './Routes.js'
import passport from '../Config/passportConfig.js'
import SessionControllers from '../Controllers/Sessions.controllers.js'

export default class SessionRoutes extends Routes {
  constructor () {
    super()
    this.router = express.Router() // Crear un enrutador de Express
    this.controller = new SessionControllers()
    this.getRouter() // Configurar las rutas
  }

  getRouter () {
    this.router
      .post('/register', this.controller.register) // Ruta para registrar un usuario
      .post('/login', this.controller.login) // Ruta para iniciar sesión
      .get('/role', passport.authenticate('jwt', { session: false }), this.controller.getRole) // Ruta para obtener el rol del usuario
      .get('/username', this.controller.getUsername) // Ruta para obtener el nombre de usuario
      .post('/logout', this.controller.logout) // Ruta para cerrar sesión
      .post('/refresh-token', this.controller.refreshToken) // Ruta para refrescar el token
    return this.router
  }
}
