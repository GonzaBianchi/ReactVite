import z from 'zod'

const userSchema = z.object({
  first_name: z.string({
    invalid_type_error: 'El nombre debe ser un string',
    required_error: 'El nombre es requerido'
  }),
  last_name: z.string({
    invalid_type_error: 'El apellido debe ser un string',
    required_error: 'El apellido es requerido'
  }),
  phone: z.number().int().positive(),
  email: z.string({
    invalid_type_error: 'El email debe ser un string',
    required_error: 'El email es requerido'
  }).email('Debe ser un correo electrónico válido'),
  username: z.string({
    invalid_type_error: 'El username debe ser un string',
    required_error: 'El username es requerido'
  }).min(6, 'El usuario debe tener al menos 6 caracteres'),
  password: z.string({
    invalid_type_error: 'La contraseña debe ser un string',
    required_error: 'La contraseña es requerida'
  }).min(8, 'La contraseña debe tener al menos 8 caracteres')
})

const loginSchema = z.object({
  username: z.string().min(6),
  password: z.string().min(8)
})

export function validateUserLogin (object) {
  return loginSchema.safeParse(object)
}

export function validateUser (object) {
  return userSchema.safeParse(object)
}
