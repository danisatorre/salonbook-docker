#!/bin/bash
# Se ejecuta SOLO la primera vez que arranca el contenedor (volumen vacío).
# Importa los JSON en las colecciones usuarios, servicios y reservas
# de la base de datos "salonbook".
set -e

for coleccion in usuarios servicios reservas; do
  mongoimport \
    --username "$MONGO_INITDB_ROOT_USERNAME" \
    --password "$MONGO_INITDB_ROOT_PASSWORD" \
    --authenticationDatabase admin \
    --db salonbook --collection "$coleccion" \
    --jsonArray --file "/docker-entrypoint-initdb.d/$coleccion.json"
done
