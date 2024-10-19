export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

// export const isAdmin = (req, res, next) => {
//   if (req.user.role === 'ADMIN') {
//     return next()
//   } else {
//     return res.status(403).json({ error: 'Acceso denegado: No tienes permisos de administrador.' })
//   }
// }
