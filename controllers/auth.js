const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const modeloUsuario = require('../models/usuario')

// Datos del usuario que se pueden devolver (nunca la contraseña)
function usuarioPublico(usuario) {
  return {
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  }
}

// POST /api/auth/registro
async function registro(req, res) {
  try {
    const { nombre, email, password } = req.body

    const usuario = new modeloUsuario({ nombre, email, password })

    // Validamos antes de cifrar, porque el hash siempre mide 60 caracteres y el minlength de la contraseña ya no se podría comprobar
    await usuario.validate()

    usuario.password = await bcrypt.hash(password, 10)
    await usuario.save()

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: usuarioPublico(usuario)
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ mensaje: 'Datos no validos', errores })
    }
    // 11000 = clave duplicada (el email tiene unique: true)
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'El email ya esta registrado' })
    }
    console.error(error)
    res.status(500).json({ mensaje: 'Error al registrar el usuario' })
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'El email y la contraseña son obligatorios' })
    }

    const usuario = await modeloUsuario.findOne({ email: String(email).toLowerCase().trim() })

    // Mensaje de fallo al introducir mal el email o la contraseña
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' })
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({ token, usuario: usuarioPublico(usuario) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al iniciar sesion' })
  }
}

// GET /api/auth/perfil (requiere token)
async function perfil(req, res) {
  try {
    const usuario = await modeloUsuario.findById(req.usuario.id)
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    }
    res.json({ usuario: usuarioPublico(usuario) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al obtener el perfil' })
  }
}

module.exports = { registro, login, perfil }