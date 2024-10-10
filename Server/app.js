import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import SessionRoutes from './Routes/Sessions.routes.js'
import UsersRoutes from './Routes/Users.routes.js'
import AppointmentsRoutes from './Routes/Appointments.routes.js'
import VansRoutes from './Routes/Vans.routes.js'
import PricesRoutes from './Routes/Prices.routes.js'

dotenv.config()

const app = express()
app.disable('x-powered-by')
const PORT = process.env.PORT || 8080

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

const sessionRoutes = new SessionRoutes()
const userRoutes = new UsersRoutes()
const appointmentRoutes = new AppointmentsRoutes()
const vanRoutes = new VansRoutes()
const priceRoutes = new PricesRoutes()

app.use('/session', sessionRoutes.getRouter())
app.use('/user', userRoutes.getRouter())
app.use('/appointment', appointmentRoutes.getRouter())
app.use('/van', vanRoutes.getRouter())
app.use('/prices', priceRoutes.getRouter())

app.listen(PORT, () => { console.log(`Server started on port http://localhost:${PORT}`) })
