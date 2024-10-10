/* eslint-disable camelcase */
export default class Appointment {
  constructor (id_user, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description) {
    this.id_user = id_user
    this.day = day
    this.schedule = schedule
    this.start_address = start_address
    this.end_address = end_address
    this.duration = duration
    this.cost = cost
    this.stairs = stairs
    this.distance = distance
    this.staff = staff
    this.description = description
  }
}
