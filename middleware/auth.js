const jwt = require('jsonwebtoken')

// Comprueba que la petición trae un token válido en la cabecera
function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || ''
  const [tipo, token] = cabecera.split(' ')

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'No has iniciado sesion' })
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = { id: datos.id, rol: datos.rol } // disponible en los controladores
    next()
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token no valido o caducado' })
  }
}

// Usar siempre después de verificarToken
function esAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso solo para administradores' })
  }
  next()
}

module.exports = { verificarToken, esAdmin }