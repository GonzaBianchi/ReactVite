import z from 'zod'

const vanSchema = z.object({
  driver_name: z.string({
    invalid_type_error: 'El nombre debe ser un string',
    required_error: 'El nombre es requerido'
  }).min(1, 'El nombre no puede estar vacío'),
  license_plate: z.string({
    invalid_type_error: 'La placa debe ser un string',
    required_error: 'La placa es requerida'
  }).length(7, 'La patente debe tener 7 caracteres'),
  model: z.string({
    invalid_type_error: 'El modelo debe ser un string',
    required_error: 'El modelo es requerido'
  })
})

export function validateVan (object) {
  return vanSchema.safeParse(object)
}
