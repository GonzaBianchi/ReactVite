/* eslint-disable camelcase */
import PricesDaoMysql from '../DB/DAOS/prices.dao.mysql.js'

export default class PricesControllers {
  constructor () {
    this.db = new PricesDaoMysql()
  }

  getPrices = async (req, res) => {
    try {
      const prices = await this.db.getPrices()
      res.status(200).json({ prices })
    } catch (error) {
      console.error('Error al obtener los precios:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  updatePrice = async (req, res) => {
    try {
      const id = req.params.id
      const { service_name, price } = req.body

      if (price === '') return res.status(400).json({ error: 'El precio no puede estar vacío' })
      if (service_name === '') return res.status(400).json({ error: 'El servicio no puede estar vacío' })

      const newPrice = parseFloat(price)
      const result = await this.db.updatePrice(id, service_name, newPrice)
      res.json(result)
    } catch (error) {
      console.error('Error al actualizar el precio:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
