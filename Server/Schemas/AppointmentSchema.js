import z from 'zod'

const appointmentSchema = z.object({
  start_address: z.string({
    required_error: 'La dirección inicial es requerida'
  }).min(1, 'La dirección inicial no puede estar vacía'),
  end_address: z.string({
    required_error: 'La dirección destino es requerida'
  }).min(1, 'La dirección destino no puede estar vacía'),
  description: z.string({
    required_error: 'La descripción es requerida'
  }).min(10, 'Por favor describa mejor los muebles a transportar')
})

export function validateAppointment (object) {
  return appointmentSchema.safeParse(object)
}
