# 🤖 Robot Backend – Intercarreras 2025

API desarrollada en **Node.js + Express** para el proyecto interdisciplinario  
**Robot Autónomo Inteligente** del trabajo **Intercarreras 2025**.

Esta API actúa como el **núcleo de comunicación** entre el *Bridge* (microservicio intermedio)  
y el resto de los módulos del sistema (control remoto, panel administrativo, etc).

---

## 🎯 Objetivo

Centralizar el flujo de datos entre los servicios del robot:

- 🔁 Recibir datos del **Bridge** (sensores, estado e imágenes).
- 🛰️ Enviar **órdenes de movimiento** y tareas al robot.
- 🧠 Servir como base para futuras integraciones con **MongoDB Atlas** y otros microservicios.

---

## 🧱 Estructura del Proyecto

robot-backend/
├─ src/
│ ├─ libs/
│ │ └─ validator.js
│ ├─ routes/
│ │ ├─ commands.routes.js → /api/robot/command
│ │ ├─ sensors.routes.js → /api/sensors/data
│ │ ├─ status.routes.js → /api/status
│ │ └─ images.routes.js → /api/robot/image
│ ├─ config.js
│ └─ server.js
├─ .env.example
├─ package.json
└─ README.md


---

## ⚙️ Instalación y Ejecución

### Clonar el repositorio

git clone https://github.com/Santiago-Lazos/robot-backend.git
cd robot-backend

### Instalar dependencias

npm install

### Crear el archivo .env

PORT=3000
BRIDGE_URL=http://localhost:4000
MONGO_URI=

### Iniciar el servidor

npm run dev

### Endpoints Principales

🟢 GET /health

Verifica el estado del servidor.

🟢 POST /api/robot/command

Envía órdenes al robot (a través del Bridge).

Body ejemplo:

{
  "robotId": "robot-demo",
  "source": "web_rc",
  "task": "move_forward",
  "value": 10
}

🟢 GET /api/robot/command 

Devuelve el historial de comandos enviados.

🟢 POST /api/sensors/data

Recibe lecturas de sensores (ultrasónico, cámara, etc).
Por ahora guarda la información en memoria.

🟢 POST /api/status/update

Actualiza el estado del robot (modo, batería, etc).

🟢 GET /api/status

Devuelve el último estado y logs recientes.

🟢 GET /api/status/stream

Envío en tiempo real (SSE).

🟢 POST /api/robot/image

Recibe metadatos de una imagen capturada por el robot.

Body ejemplo:

{
  "robotId": "robot-demo",
  "url": "https://r2.example.com/bucket/img-123.jpg",
  "type": "sign",
  "description": "flecha izquierda"
}

🟢 GET /api/robot/image → Lista las imágenes registradas.

🧩 Variables de Entorno

Archivo: .env.example

# Puerto HTTP del servidor
PORT=3000

# URL del microservicio Bridge (Fabri)
BRIDGE_URL=http://localhost:4000

# URL de conexión a MongoDB Atlas (a futuro)
MONGO_URI=






