const mongoose = require('mongoose')

const reservaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario', // referencia a la tabla coleccion Usuario
      required: [true, 'El usuario es obligatorio']
    },
    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servicio', // Referencia a la colección Servicio
      required: [true, 'El servicio es obligatorio']
    },
    fecha: {
      type: String,
      required: [true, 'La fecha es obligatoria'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD']
    },
    horaInicio: {
      type: String, // 'HH:MM'
      required: [true, 'La hora de inicio es obligatoria'],
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora de inicio debe tener el formato HH:MM']
    },
    horaFin: {
      type: String, // 'HH:MM'
      required: [true, 'La hora de fin es obligatoria'],
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora de fin debe tener el formato HH:MM']
    },
    estado: {
      type: String,
      enum: {
        values: ['confirmada', 'cancelada'],
        message: 'El estado debe ser confirmada o cancelada'
      },
      default: 'confirmada'
    }
  },
  { timestamps: true } // guarda cuando se crea y actualiza cada documento
)

module.exports = mongoose.model('Reserva', reservaSchema)
