require('dotenv').config()

const path = require('path')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT;
// BASE_PATH solamente se utiliza cuando se publica la web en un subdirectorio, por ejemplo: http://localhost:3000/salonbook/
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '');
const mongodbHost = process.env.MONGODB_URL;
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PASSWORD;
const mongodbURL = `mongodb://${mongoUser}:${mongoPwd}@${mongodbHost}`;

// Todas las rutas de la aplicación cuelgan del prefijo BASE_PATH
const router = express.Router()

// Middlewares
router.use(express.json())
router.use(express.static(path.join(__dirname, 'public')))

// Rutas de la API
router.use('/api/auth', require('./routes/auth-api'))
router.use('/api/servicios', require('./routes/servicios-api'))
router.use('/api/reservas', require('./routes/reservas-api'))

// Rutas de la WEB
router.use('/', require('./routes/web-routes'))

app.use(BASE_PATH || '/', router)

// Con prefijo, cualquier ruta fuera de él redirige al inicio de la web
if (BASE_PATH) {
  app.use((req, res) => res.redirect(`${BASE_PATH}/`))
}

// Conexión a MongoDB: el servidor solo arranca si la conexión funciona
async function start() {
  try {
    // Evitamos aceptar peticiones hasta que MongoDB este disponible
    await mongoose.connect(mongodbURL)
    app.listen(PORT, () => {
      console.log(`Servidor alojado en http://localhost:${PORT}${BASE_PATH}/`);
      console.log(`Conectado a MongoDB en ${mongodbHost}`);
    })
  } catch (error) {
    console.error('ERROR: No se ha podido conectar a MongoDB:', error.message)
    process.exit(1)
  }
}

start()
