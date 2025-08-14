# TFINAL Frontend (React + Vite)

Frontend base para consumir los servicios creados en la **Tarea 02.03**. Incluye modo **mock** opcional para que la app funcione sin backend mientras conectas tu API real.

## Requisitos
- Node.js 18+ y npm

## Instalación
```bash
npm install
```

## Variables de entorno
Copia `.env.example` a `.env` y ajusta:
```ini
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` permite usar un backend local simulado (localStorage).
- Cuando tu API esté lista, pon `VITE_USE_MOCK=false` y configura `VITE_API_BASE_URL`.

## Ejecutar en desarrollo
```bash
npm run dev
```

## Compilar para producción
```bash
npm run build
npm run preview
```

## Estructura principal
```
src/
  components/
  pages/
  services/
  main.jsx
  App.jsx
  routes.jsx
  styles.css
```

## Endpoints esperados (ajusta a tu API)
- `POST /auth/login` → { token }
- `GET /productos`
- `POST /productos`
- `PUT /productos/:id`
- `DELETE /productos/:id`

> Si `VITE_USE_MOCK=true`, estos endpoints se simulan con `localStorage`.

## Git y commits (20+)
1. Inicializa el repo y ejecuta `bash seed_commits.sh` para generar una historia mínima de 20 commits (ajusta mensajes y cambios reales).
2. **Recomendado**: crea issues/tareas por integrante y haz commits pequeños y frecuentes.

## Licencia
Uso académico.
