/* eslint-disable camelcase */
import VansDaoMysql from '../DB/DAOS/vans.dao.mysql.js'
import { validateVan } from '../Schemas/VanSchema.js'

export default class VansControllers {
  constructor () {
    this.db = new VansDaoMysql()
  }

  getVans = async (req, res) => {
    try {
      const vans = await this.db.getVans()
      // console.log('Vans retrieved:', vans)
      res.status(200).json({ vans })
    } catch (error) {
      console.error('Error al obtener las camionetas:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  getAvailableVans = async (req, res) => {
    try {
      const { date, schedule } = req.query

      console.log(date, schedule)

      // Validar que se proporcionen fecha y horario
      if (!date || !schedule) {
        return res.status(400).json({
          error: 'Se requiere fecha y horario para buscar camionetas disponibles'
        })
      }

      const vans = await this.db.getAvailableVans(date, schedule)

      res.status(200).json({ vans })
    } catch (error) {
      console.error('Error al obtener las camionetas disponibles:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  addVan = async (req, res) => {
    const van = req.body
    const result = validateVan(van)

    if (result.error) {
      return res.status(400).json({ error: result.error.issues })
    }

    const { driver_name, license_plate, model } = result.data

    try {
      const newVan = {
        driver_name,
        license_plate,
        model
      }

      const saveResult = await this.db.addVan(newVan)

      return res.status(201).json({ message: 'Van agregada correctamente: ', saveResult })
    } catch (error) {
      console.error('Error al agregar la camioneta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  updateVan = async (req, res) => {
    try {
      const vanId = req.params.id
      const van = req.body
      const result = validateVan(van)

      if (result.error) {
        return res.status(400).json({ error: result.error.issues })
      }

      const { driver_name, license_plate, model } = result.data

      const updatedVan = {
        driver_name,
        license_plate,
        model
      }

      const saveResult = await this.db.updateVan(vanId, updatedVan)

      if (saveResult.affectedRows > 0) {
        return res.status(200).json({ message: 'Van actualizada correctamente', saveResult })
      } else {
        return res.status(404).json({ error: 'No se encontró la van para actualizar' })
      }
    } catch (error) {
      console.error('Error al actualizar la camioneta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  updateAvailableVan = async (req, res) => {
    try {
      const vanId = req.params.id

      const result = await this.db.updateAvailableVan(vanId)
      res.json(result)
    } catch (error) {
      console.error('Error al actualizar el estado de la camioneta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  deleteVan = async (req, res) => {
    try {
      const vanId = req.params.id
      const result = await this.db.deleteVan(vanId)
      res.json(result)
    } catch (error) {
      console.error('Error al eliminar la camioneta:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
