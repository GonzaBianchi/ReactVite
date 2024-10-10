import VansDaoMysql from '../DB/DAOS/vans.dao.mysql.js'

export default class VansControllers {
  constructor () {
    this.db = new VansDaoMysql()
  }

  addVan = async (req, res) => {
    const van = req.body
    const result = await this.db.addVan(van)
    res.json(result)
  }

  deleteVan = async (req, res) => {
    const vanId = req.params.id
    const result = await this.db.deleteVan(vanId)
    res.json(result)
  }
}
