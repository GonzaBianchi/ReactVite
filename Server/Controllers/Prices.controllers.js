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
      // eslint-disable-next-line camelcase
      const { service_name, price } = req.body
      const newPrice = parseFloat(price)
      const result = await this.db.updatePrice(id, service_name, newPrice)
      console.log('Price updated:', result)
      res.json(result)
    } catch (error) {
      console.error('Error al actualizar el precio:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
