const express = require('express')
const { disponibles, crear, misReservas, listarPorDia, cancelar } = require('../controllers/reservas')
const { verificarToken, esAdmin } = require('../middleware/auth')

const router = express.Router()

// Pública: horas libres de un día para un servicio
router.get('/disponibles', disponibles)

// Cliente con sesión
router.post('/', verificarToken, crear)
router.get('/mis-reservas', verificarToken, misReservas)
// el controlador comprueba si la reserva es suya o si es admin
router.patch('/:id/cancelar', verificarToken, cancelar)

// Solo admin: reservas de un día
router.get('/', verificarToken, esAdmin, listarPorDia)

module.exports = router
