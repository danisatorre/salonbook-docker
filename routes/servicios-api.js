const express = require('express')
const { listar, obtener, crear, editar, borrar } = require('../controllers/servicios')
const { verificarToken, esAdmin } = require('../middleware/auth')

const router = express.Router()

// Públicas: cualquiera puede ver los servicios
router.get('/', listar)
router.get('/:id', obtener)

// Solo admin: primero se comprueba el token y después el rol
router.post('/', verificarToken, esAdmin, crear)
router.patch('/:id', verificarToken, esAdmin, editar)
router.delete('/:id', verificarToken, esAdmin, borrar)

module.exports = router
