const express = require('express')
const { registro, login, perfil } = require('../controllers/auth')
const { verificarToken } = require('../middleware/auth')

const router = express.Router()

router.post('/registro', registro)
router.post('/login', login)
router.get('/perfil', verificarToken, perfil)

module.exports = router