import z from 'zod'

const userSchema = z.object({
  first_name: z.string({
    invalid_type_error: 'El nombre debe ser un string',
    required_error: 'El nombre es requerido'
  }).min(1, 'El nombre no puede estar vacío'),
  last_name: z.string({
    invalid_type_error: 'El apellido debe ser un string',
    required_error: 'El apellido es requerido'
  }).min(1, 'El apellido no puede estar vacío'),
  phone: z.number().int().positive().refine(value => value.toString().length >= 10, {
    message: 'El número de teléfono debe tener al menos 8 dígitos'
  }),
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

const userUpdateSchema = z.object({
  first_name: z.string({
    invalid_type_error: 'El nombre debe ser un string',
    required_error: 'El nombre es requerido'
  }).min(1, 'El nombre no puede estar vacío'),
  last_name: z.string({
    invalid_type_error: 'El apellido debe ser un string',
    required_error: 'El apellido es requerido'
  }).min(1, 'El apellido no puede estar vacío'),
  phone: z.number().int().positive().refine(value => value.toString().length >= 10, {
    message: 'El número de teléfono debe tener al menos 10 dígitos'
  }),
  email: z.string({
    invalid_type_error: 'El email debe ser un string',
    required_error: 'El email es requerido'
  }).email('Debe ser un correo electrónico válido'),
  username: z.string({
    invalid_type_error: 'El username debe ser un string',
    required_error: 'El username es requerido'
  }).min(6, 'El usuario debe tener al menos 6 caracteres')
})

export function validateUserLogin (object) {
  return loginSchema.safeParse(object)
}

export function validateUser (object) {
  return userSchema.safeParse(object)
}

export function validateUserUpdate (object) {
  return userUpdateSchema.safeParse(object)
}
