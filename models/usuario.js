const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede superar los 50 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true, // crea un índice único en MongoDB
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El email no es valido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'] // se guarda cifrada con bcrypt desde el controlador
    },
    rol: {
      type: String,
      enum: {
        values: ['cliente', 'admin'],
        message: 'El rol debe ser cliente o admin'
      },
      default: 'cliente'
    }
  },
  { timestamps: true } // guarda cuando se crea y actualiza cada documento
)

module.exports = mongoose.model('Usuario', usuarioSchema)