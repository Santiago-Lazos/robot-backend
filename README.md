# 🤖 Backend – Intercarreras

API desarrollada en **Node.js + Express**.

**Prototipo de Montacargas Autónomo** del trabajo **Intercarreras 2025**.

Esta API actúa como el **núcleo de comunicación** entre el **Bridge** (microservicio intermedio que se comunica con el robot vía MQTT) y el resto de los módulos del sistema, el frontend (control remoto y panel administrativo).

---

## 🎯 Objetivo

Centralizar el flujo de datos entre los servicios del robot:

- 🔁 Recibir datos del **Bridge**, provenientes del robot.
- 🛰️ Enviar **órdenes de movimiento y tareas** al robot, a través del **Bridge**.
- 🧠 Guardar datos en **MongoDB Atlas** y **Cloudflare R2**.
- 📡 Notificar eventos en tiempo real a través de **SSE**.
- 📦 Suministrar datos a través de **API REST** al **control remoto** y **panel administrativo**.

---

## 🧱 Estructura del Proyecto

```
robot-backend/
├─ src/
│ ├─ models/
<<<<<<< HEAD
│ │ ├─ Image.js → Esquema de imágenes en MongoDB Atlas
│ │ └─ Log.js → Esquema de logs del sistema (errores e información)
=======
│ │ └─ Image.js → Esquema de imágenes en MongoDB Atlas
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
│ │
│ ├─ routes/
│ │ ├─ commands.routes.js → /api/robot/command → Envío de comandos al robot
│ │ ├─ sensors.routes.js → /api/sensors/data → Lectura de sensores
│ │ ├─ status.routes.js → /api/status → Estado general del robot
│ │ ├─ images.routes.js → /api/images → Registro, análisis y consulta de imágenes
<<<<<<< HEAD
│ │ ├─ logs.routes.js → /api/logs → Consulta de logs guardados en MongoDB (panel administrativo)
│ │ ├─ webhook.routes.js → /api/webhook → Recepción de datos desde el Bridge (errores, imágenes, etc.)
=======
│ │ ├─ webhook.routes.js → /api/webhook → Recepción de datos desde el Bridge
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
│ │ └─ stream.routes.js → /api/stream → Eventos SSE en tiempo real
│ │
│ ├─ utils/
│ │ ├─ messageHandlers/ → Funciones que manejan los tipos de mensajes entrantes
│ │ │ ├─ handleAck.js → Procesa confirmaciones (ACK)
│ │ │ ├─ handleConnected.js → Procesa conexión del robot
│ │ │ ├─ handleDisconnected.js → Procesa desconexión del robot
<<<<<<< HEAD
│ │ │ ├─ handleError.js → Procesa errores del robot y los guarda en logs de MongoDB
│ │ │ ├─ handleImage.js → Procesa imágenes capturadas por el robot
│ │ │ ├─ handleObstacle.js → Procesa detección de obstáculos
=======
│ │ │ ├─ handleError.js → Procesa errores del robot
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
│ │ │ ├─ handleUnknown.js → Captura tipos de mensajes no reconocidos
│ │ │ └─ index.js → Exporta y organiza los handlers
│ │ ├─ analyzeImageWithAI.js → Análisis de imágenes con OpenAI
│ │ ├─ decodeQRFromBuffer.js → Decodificación de QR desde buffer
│ │ ├─ handleSign.js → Procesa señales (órdenes) del robot
<<<<<<< HEAD
│ │ ├─ upload.js → Subida de imágenes a Cloudflare R2
│ │ └─ sendCommand.js → Envío de comandos al robot a través del Bridge
│ │
│ ├─ config.js → Configuración general y variables de entorno
│ └─ server.js → Servidor principal Express, conexión a MongoDB y registro de rutas
=======
│ │ ├─ upload.js → Subida de imágenes
│ │ └─ sendCommand.js → Envío de comandos al robot
│ │
│ ├─ config.js → Configuración general y variables de entorno
│ └─ server.js → Servidor principal Express y conexión a MongoDB
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
│
├─ .env.example → Ejemplo de variables de entorno necesarias
├─ package.json → Dependencias del proyecto
├─ package-lock.json → Versión bloqueada de dependencias
└─ README.md → Documentación técnica de la API
<<<<<<< HEAD
=======
```
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d

---

## ⚙️ Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Santiago-Lazos/robot-backend.git
cd robot-backend
```

### 2️⃣ Instalar

```bash
npm install
```

### 3️⃣ Crear el archivo .env

```bash
cp .env.example .env
```

### 4️⃣ Iniciar el servidor

```bash
npm run dev
```

---

### Desarrollo local de API

La API quedará disponible para desarrollo local en:

🔗 http://localhost:3000

### 🌐 API en producción

La API está desplegada en Render: [https://robot-backend-6o4d.onrender.com](https://robot-backend-6o4d.onrender.com)

### 🌐 Endpoints Principales (API REST)

#### 🚀 Comandos

- POST `/api/robot/command` → Envía un comando al robot a través del **Bridge**.

Body de ejemplo:

```json
{
  "robotId": "68faa22f17d51b1089c1f1d5",
  "commandType": "move",
  "content": {
    "direction": "forward"
  }
}
```

#### 📡 Sensores

- POST `/api/sensors/data` → Recibe lecturas del sensor ultrasónico o similares.

#### ⚙️ Estado del Robot

- GET `/api/status` → Devuelve el último estado conocido del robot.
- POST `/api/status/update` → Actualiza el estado (para pruebas locales).
- GET `/api/status/stream` → Envío en tiempo real (SSE).

#### 🖼️ Imágenes

- POST `/api/images/upload` → Sube una imagen a Cloudflare R2 y registra en MongoDB. Espera un archivo en el campo `image` (multipart/form-data).
- GET `/api/images` → Lista todas las imágenes registradas en MongoDB.
- GET `/api/images/:id` → Obtiene una imagen por su ObjectID de MongoDB.
- POST `/api/images/scan-qr` → Escanea un QR desde una imagen subida por multipart/form-data.
- POST `/api/images/scan-qr/url` → Escanea un QR desde una URL.
- POST `/api/images/scan-qr/base64` → Escanea un QR desde una base64.
- POST `/api/images/ai-analyze` → Analiza una imagen con IA.

<<<<<<< HEAD
---

### 🧾 Logs del sistema (Panel de Administración)

Los **logs** registran los eventos relevantes del sistema, como errores detectados por el robot o información general.  
Esta información puede visualizarse desde el **panel de administración**, permitiendo monitorear el estado del sistema y detectar fallos en tiempo real.

- POST `/api/webhook` 

Recibe mensajes desde el **Bridge**, incluyendo errores provenientes del robot.

**Body de ejemplo (error reportado):**

```json
{
  "messageType": "error",
  "content": {
    "type": "camera",
    "message": "Error al inicializar cámara",
    "robotId": "68faa22f17d51b1089c1f1d5"
  }
}
```

- GET `/api/webhook` → Devuelve todos los registros guardados en la base de datos.

#### 🌐 Webhook

=======
#### 🌐 Webhook

>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
- POST `/api/webhook` → Recibe datos desde el Bridge (por ejemplo, imágenes o lecturas).

---

### 🧠 Esquema de Base de Datos

Modelo `Image`:

```json
{
  robotId: String,
  url: String,
  type: String,
  description: String,
  timestamp: Date
}
```

Modelo `Logs`:

```json
{
  "_id": ObjectId,
  "timestamp": Date,
  "level": "info" | "error",
  "message": String,
  "robotId": ObjectId
}
```

---

### 📡 Eventos SSE (Server-Sent Events)

El backend implementa **Server-Sent Events (SSE)** para notificar en tiempo real al frontend sobre eventos importantes sin necesidad de hacer peticiones constantes.

El endpoint del stream es: `/api/stream`

| Evento               | Descripción                                                  | Data enviada                            |
| -------------------- | ------------------------------------------------------------ | --------------------------------------- |
| `new_image`          | Se dispara cuando el robot envía una nueva imagen procesada. | `{ id, timestamp }`                     |
| `ack_received`       | Confirmación de que el robot recibió o completó una acción.  | `{ type, action, state, timestamp }`    |
| `robot_connected`    | Indica que el robot se ha conectado correctamente.           | `{ status: "connected", timestamp }`    |
| `robot_disconnected` | Indica que el robot se ha desconectado.                      | `{ status: "disconnected", timestamp }` |
<<<<<<< HEAD
| `robot_error`        | Se dispara cuando el robot informa un error.                 | `{ type, message, timestamp }`          |
=======
| `robot_error`        | Se dispara cuando el robot informa un error.                 | `{ type, message, timestamp }`          |
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
