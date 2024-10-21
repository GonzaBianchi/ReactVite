import Appointment from '../Models/Appointments.js'

export default class AppointmentsHelpers {
  parseAppointment (data) {
    // eslint-disable-next-line camelcase
    const { id_user, day, schedule, start_address, end_address, duration, cost, stairs, distance, staff, description } = data
    const appointment = new Appointment(id_user, day, schedule, start_address, end_address, duration, parseFloat(cost), parseInt(stairs), parseInt(distance), Boolean(staff), description)

    return appointment
  }
}
