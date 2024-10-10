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
}
