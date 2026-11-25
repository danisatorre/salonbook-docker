const mongoose = require('mongoose')
const modeloServicio = require('../models/servicio')

// Campos que se pueden enviar al crear o editar
function datosServicio(body) {
  const { nombre, descripcion, precio, duracion, activo, imgServicio } = body
  return { nombre, descripcion, precio, duracion, activo, imgServicio }
}

// Respuesta común para errores de validación y errores inesperados
function responderError(res, error, mensaje) {
  if (error.name === 'ValidationError') {
    const errores = Object.values(error.errors).map(e =>
      e.name === 'CastError' ? `El campo ${e.path} no es valido` : e.message
    )
    return res.status(400).json({ mensaje: 'Datos no validos', errores })
  }
  // findByIdAndUpdate lanza CastError si un dato no es del tipo correcto (ej: precio 'abc')
  if (error.name === 'CastError') {
    return res.status(400).json({ mensaje: 'Datos no validos', errores: [`El campo ${error.path} no es valido`] })
  }
  console.error(error)
  res.status(500).json({ mensaje })
}

// Busca un servicio por id; devuelve null si el id no es válido o no existe
async function buscarPorId(id) {
  if (!mongoose.isValidObjectId(id)) return null
  return modeloServicio.findById(id)
}

// GET /api/servicios : solo los servicios activos
// Devuelve los servicios activos ordenados por nombre
async function listar(req, res) {
  try {
    const servicios = await modeloServicio.find({ activo: true }).sort({ precio: 1})
    res.json(servicios)
  } catch (error) {
    responderError(res, error, 'Error al obtener los servicios')
  }
}

// GET /api/servicios/:id (público)
// Devuelve un servicio por su id
async function obtener(req, res) {
  try {
    const servicio = await buscarPorId(req.params.id)
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' })
    }
    res.json(servicio)
  } catch (error) {
    responderError(res, error, 'Error al obtener el servicio')
  }
}

// POST /api/servicios (admin)
// Crear un servicio
async function crear(req, res) {
  try {
    const servicio = await modeloServicio.create(datosServicio(req.body))
    res.status(201).json(servicio)
  } catch (error) {
    responderError(res, error, 'Error al crear el servicio')
  }
}

// PATCH /api/servicios/:id (admin)
// Editar un servicio
async function editar(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' })
    }

    // Nos quedamos solo con los campos que vengan en el body
    const datos = datosServicio(req.body)
    const cambios = {}
    for (const campo in datos) {
      if (datos[campo] !== undefined) cambios[campo] = datos[campo]
    }

    // Actualiza en MongoDB solo los campos de 'cambios'
    const servicio = await modeloServicio.findByIdAndUpdate(
      req.params.id,
      { $set: cambios },
      {
        runValidators: true, // aplicar las validaciones del modelo
        returnDocument: 'after' // devuelve el servicio ya actualizado
      }
    )

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' })
    }
    res.json(servicio)
  } catch (error) {
    responderError(res, error, 'Error al editar el servicio')
  }
}

// DELETE /api/servicios/:id (admin)
// No se borra de la db, se marca como inactivo
async function borrar(req, res) {
  try {
    const servicio = await buscarPorId(req.params.id)
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' })
    }

    servicio.activo = false
    await servicio.save()
    res.json({ mensaje: 'Servicio eliminado correctamente' })
  } catch (error) {
    responderError(res, error, 'Error al eliminar el servicio')
  }
}

module.exports = { listar, obtener, crear, editar, borrar }