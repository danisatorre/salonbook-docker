# SalonBook: aplicación Node.js + MongoDB con Docker

Aplicación web de reservas para una peluquería (Express + MongoDB).
Las imágenes están publicadas en GitHub Container Registry:

- `ghcr.io/danisatorre/salonbook-app:1.0`: la aplicación
- `ghcr.io/danisatorre/salonbook-mongo:1.0`: MongoDB 7.0 con los datos iniciales (usuarios, servicios y reservas)

## Requisitos

Solo Docker (con Docker Compose). No hace falta instalar Node.js ni MongoDB.

## Puesta en marcha

```bash
git clone https://github.com/danisatorre/salonbook-docker.git
cd salonbook-docker
cp .env.example .env      # y edita .env para poner tus propias claves
docker compose pull       # descarga las imágenes desde ghcr.io
docker compose up -d      # arranca MongoDB y la aplicación
```

Abre http://localhost:3000

## Parar

```bash
docker compose down       # para y borra los contenedores (los datos se conservan)
docker compose down -v    # además BORRA los datos (vuelven los iniciales)
```
