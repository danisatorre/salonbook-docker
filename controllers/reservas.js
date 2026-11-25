const modeloReserva = require('../models/reserva')
const modeloServicio = require('../models/servicio')

// Horas a las que puede empezar una reserva
const horasDelDia = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30'
]

// Pasa una hora a minutos: '09:30' -> 570
function aMinutos(hora) {
  const partes = hora.split(':')
  return parseInt(partes[0]) * 60 + parseInt(partes[1])
}

// Pasa minutos a hora: 570 -> '09:30'
function aHora(minutos) {
  let h = Math.floor(minutos / 60)
//   console.log(h);
  let m = minutos % 60
//   console.log(m);
  if (h < 10){
    h = '0' + h
  } 
  if (m < 10){
    m = '0' + m
  }
//   console.log(h + ':' + m);
  return h + ':' + m
}

// Devuelve las horas libres de un día para un servicio que dura 'duracion' minutos
async function calcularHorasLibres(fecha, duracion) {
  // Reservas confirmadas de ese día (las canceladas se descartan)
  const reservas = await modeloReserva.find({ fecha: fecha, estado: 'confirmada' })
  const libres = []

  for (let i = 0; i < horasDelDia.length; i++) {
    const inicio = aMinutos(horasDelDia[i])
    const fin = inicio + duracion
    let libre = true

    // El servicio tiene que acabar como mucho a las 20:00
    if (fin > aMinutos('20:00')) {
      libre = false
    }

    // Comprobamos que no se solape con ninguna reserva
    for (let j = 0; j < reservas.length; j++) {
      const inicioReserva = aMinutos(reservas[j].horaInicio)
      const finReserva = aMinutos(reservas[j].horaFin)
      if (inicio < finReserva && fin > inicioReserva) {
        libre = false
      }
    }

    // console.log(i);
    if (libre) {
      libres.push(horasDelDia[i])
    }
  }

  return libres
}

// GET /api/reservas/disponibles?fecha=YYYY-MM-DD&servicio=<id> (público)
async function disponibles(req, res) {
  try {
    const fecha = req.query.fecha
    const servicioId = req.query.servicio

    if (!fecha || !servicioId) {
      return res.status(400).json({ mensaje: 'Faltan la fecha o el servicio' })
    }

    const servicio = await modeloServicio.findById(servicioId)
    if (!servicio || !servicio.activo) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' })
    }

    const horas = await calcularHorasLibres(fecha, servicio.duracion)
    res.json(horas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al obtener las horas disponibles' })
  }
}

// POST /api/reservas (cliente con sesión)
/**
Body: {
    "servicio": "<id>",
    "fecha": "2026-11-20",
    "horaInicio": "10:00"
}
 */
async function crear(req, res) {
  try {
    const servicioId = req.body.servicio
    const fecha = req.body.fecha
    const horaInicio = req.body.horaInicio

    if (!servicioId || !fecha || !horaInicio) {
      return res.status(400).json({ mensaje: 'Faltan datos de la reserva' })
    }

    const servicio = await modeloServicio.findById(servicioId)
    if (!servicio || !servicio.activo) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' })
    }

    // Solo se puede reservar si la hora está en la lista de horas libres
    const libres = await calcularHorasLibres(fecha, servicio.duracion)
    if (!libres.includes(horaInicio)) {
      return res.status(400).json({ mensaje: 'La hora elegida no esta disponible' })
    }

    // La hora de fin la calcula el servidor con la duración del servicio
    const horaFin = aHora(aMinutos(horaInicio) + servicio.duracion)

    const reserva = await modeloReserva.create({
      usuario: req.usuario.id, // el usuario sale del token, no del body
      servicio: servicioId,
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: horaFin
    })
    // console.log(reserva);
    res.status(201).json(reserva)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Datos no validos' })
    }
    console.error(error)
    res.status(500).json({ mensaje: 'Error al crear la reserva' })
  }
}

// GET /api/reservas/mis-reservas (cliente con sesión)
async function misReservas(req, res) {
  try {
    // .populate busca el servicio por el id que hay en la db y coge sus datos
    // para poder coger datos del servicio en el front mediante reserva.servicio.nombre
    const reservas = await modeloReserva
      .find({ usuario: req.usuario.id })
      .populate('servicio')
      .sort({ fecha: -1 })
    //   console.log(reservas);
    res.json(reservas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al obtener tus reservas' })
  }
}

// GET /api/reservas?fecha=YYYY-MM-DD (admin)
async function listarPorDia(req, res) {
  try {
    const fecha = req.query.fecha
    if (!fecha) {
      return res.status(400).json({ mensaje: 'La fecha es obligatoria' })
    }

    const reservas = await modeloReserva
      .find({ fecha: fecha })
      .populate('usuario', 'nombre email')
      .populate('servicio')
      .sort({ horaInicio: 1 })
    res.json(reservas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al obtener las reservas' })
  }
}

// PATCH /api/reservas/:id/cancelar (el dueño de la reserva o el admin)
async function cancelar(req, res) {
  try {
    const reserva = await modeloReserva.findById(req.params.id)
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' })
    }

    const esSuya = reserva.usuario.toString() === req.usuario.id
    const esAdmin = req.usuario.rol === 'admin'
    if (!esSuya && !esAdmin) {
      return res.status(403).json({ mensaje: 'No puedes cancelar una reserva de otro usuario' })
    }

    // No se borra: se marca como cancelada y su hora vuelve a quedar libre
    reserva.estado = 'cancelada'
    await reserva.save()
    res.json({ mensaje: 'Reserva cancelada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al cancelar la reserva' })
  }
}

module.exports = { disponibles, crear, misReservas, listarPorDia, cancelar }
