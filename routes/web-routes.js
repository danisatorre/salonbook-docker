const fs = require('fs')
const path = require('path')
const express = require('express')

const router = express.Router()

// Prefijo de la web
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '')

// Hacer que las vistas funcionen con o sin prfijo
const vistas = {}
function enviarVista(res, archivo) {
  if (!vistas[archivo]) {
    const html = fs.readFileSync(path.join(__dirname, '..', 'views', archivo), 'utf8')
    vistas[archivo] = html.replace('<base href="/">', `<base href="${BASE_PATH}/">`)
  }
  res.type('html').send(vistas[archivo])
}

// Página de inicio
router.get('/', (req, res) => {
  enviarVista(res, 'index.html')
})
// Página de login
router.get('/login', (req, res) => {
  enviarVista(res, 'login.html')
})
// Página de registro
router.get('/register', (req, res) => {
  enviarVista(res, 'registro.html')
})
// Página de mis reservas
router.get('/mis-reservas', (req, res) => {
  enviarVista(res, 'mis-reservas.html')
})
// Página de reservas
router.get('/reservas', (req, res) => {
  enviarVista(res, 'reservar.html')
})
// Página de detalle de un servicio
router.get('/servicios/:id', (req, res) => {
  enviarVista(res, 'servicio.html')
})
// Si no se introduce el id del servicio redireccionamos a los servicios de home
router.get('/servicios', (req, res) => {
  res.redirect(`${BASE_PATH}/#servicios`)
})
// Página de admin
router.get('/admin', (req, res) => {
  enviarVista(res, 'admin.html')
})
// Página de error
router.get('/error', (req, res) => {
  enviarVista(res, 'error.html')
})
// Redireccionar a home si no existe la ruta
router.use((req, res) => {
  res.redirect(`${BASE_PATH}/`)
});

module.exports = router