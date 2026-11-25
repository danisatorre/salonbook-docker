const mongoose = require('mongoose')

const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [1, 'El nombre no puede estar vacio'],
      maxlength: [100, 'El nombre no puede superar los 100 caracteres']
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripcion no puede superar los 500 caracteres'],
      default: ''
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    duracion: {
      type: Number, // en minutos
      required: [true, 'La duracion es obligatoria'],
      min: [30, 'La duracion minima es de 30 minutos'],
      max: [480, 'La duracion maxima es de 480 minutos']
    },
    imgServicio: {
      type: String,
      default: ''
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true } // guarda cuando se crea y actualiza cada documento
)

module.exports = mongoose.model('Servicio', servicioSchema)
