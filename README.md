# 🤖 Backend – Intercarreras 

API desarrollada en **Node.js + Express** 

**Prototipo de Montacargas Autónomo** del trabajo **Intercarreras 2025**.

Esta API actúa como el **núcleo de comunicación** entre el Bridge (microservicio intermedio)  
y el resto de los módulos del sistema (control remoto, panel administrativo, etc).

---

## 🎯 Objetivo

Centralizar el flujo de datos entre los servicios del robot:

- 🔁 Recibir datos del **Bridge** (sensores, estado e imágenes).
- 🛰️ Enviar **órdenes de movimiento** y tareas al robot.
- 🧠 Servir como base para integraciones con **MongoDB Atlas** y **Cloudflare R2**.

---

## 🧱 Estructura del Proyecto

robot-backend/
├─ src/
│  ├─ controllers/
│  │  └─ webhook.controller.js       → Lógica para procesar datos recibidos desde el Bridge
│  │
│  ├─ libs/
│  │  └─ validator.js                → Validación de comandos y payloads
│  │
│  ├─ models/
│  │  └─ Image.js                    → Esquema de imágenes en MongoDB Atlas
│  │
│  ├─ routes/
│  │  ├─ commands.routes.js          → /api/robot/command → Envío de comandos al robot
│  │  ├─ sensors.routes.js           → /api/sensors/data → Lectura de sensores
│  │  ├─ status.routes.js            → /api/status → Estado general del robot
│  │  ├─ images.routes.js            → /api/robot/image → Registro y consulta de imágenes
│  │  ├─ webhook.routes.js           → /api/webhook → Recepción de datos desde el Bridge
│  │  └─ stream.routes.js            → /api/stream → Eventos SSE en tiempo real
│  │
│  ├─ utils/
│  │  └─ messageHandlers/            → Funciones que manejan los tipos de mensajes entrantes
│  │     ├─ handleAck.js             → Procesa confirmaciones (ACK)
│  │     ├─ handleConnected.js       → Procesa conexión del robot
│  │     ├─ handleDisconnected.js    → Procesa desconexión del robot
│  │     ├─ handleError.js           → Procesa errores del robot
│  │     ├─ handleUnknown.js         → Captura tipos de mensajes no reconocidos
│  │     └─ index.js                 → Exporta y organiza los handlers
│  │
│  ├─ config.js                      → Configuración general y variables de entorno
│  └─ server.js                      → Servidor principal Express y conexión a MongoDB
│
├─ .env.example                      → Ejemplo de variables de entorno necesarias
├─ package.json                      → Dependencias del proyecto
├─ package-lock.json                 → Versión bloqueada de dependencias
└─ README.md                         → Documentación técnica del backend

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

Ejemplo de contenido:

PORT=3000
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
MQTT_TOPIC_CONTROL=equipo2/robot/control
MQTT_TOPIC_STATE=equipo2/robot/estado
MONGO_URI=mongodb+srv://intercarreras:***@cluster0.7ttd6fx.mongodb.net/intercarreras

### 4️⃣ Iniciar el servidor

```bash
npm run dev
```

---

### La API quedará disponible en:

🔗 http://localhost:3000

### 🌐 Endpoints Principales (API REST)

### 🚀 Comandos

POST	/api/robot/command → Envía un comando al robot a través del Bridge.

Body de ejemplo:

```json
{
  "robotId": "robot-demo",
  "source": "web_rc",
  "task": "move_forward",
  "value": 10
}
```

GET	/api/robot/command → Devuelve el historial de comandos enviados.

### 📡 Sensores

POST	/api/sensors/data	→ Recibe lecturas del sensor ultrasónico o similares.

### ⚙️ Estado del Robot

GET	/api/status	→ Devuelve el último estado conocido del robot.
POST	/api/status/update → Actualiza el estado (para pruebas locales).
GET	/api/status/stream → Envío en tiempo real (SSE).

### 🖼️ Imágenes

POST	/api/robot/image → Registra información de una imagen en MongoDB.
GET	/api/robot/image → Lista todas las imágenes registradas en la BD.

Body de ejemplo (POST):

```json
{
  "robotId": "robot-demo",
  "url": "https://pub-8690292748b74d44af49372934e22b66.r2.dev/example.jpg",
  "type": "sign",
  "description": "flecha izquierda"
}
```

### 🌐 Webhook

POST	/api/webhook	→ Recibe datos desde el Bridge (por ejemplo, imágenes o lecturas).

---

### 🧠 Esquema de Base de Datos

Modelo Image.js

```json
{
  robotId: String,
  url: String,
  type: String,        
  description: String,  
  timestamp: Date
}
```

---

### 🖥️ Dashboard y Control Remoto

Las interfaces web se comunican con esta API a través de los endpoints REST:

El control remoto envía acciones mediante /api/robot/command.

El panel de administración consulta /api/robot/image y /api/status para mostrar el estado e imágenes registradas.

La API funciona como puente entre el microservicio Bridge (MQTT) y los frontends web, garantizando una comunicación fluida y centralizada.

---

### 📡 Eventos SSE (Server-Sent Events)

El backend implementa Server-Sent Events (SSE) para notificar en tiempo real al frontend sobre eventos importantes sin necesidad de hacer peticiones constantes.

El endpoint del stream es:

/api/stream

| Evento               | Descripción                                                  | Data enviada                            |
| -------------------- | ------------------------------------------------------------ | --------------------------------------- |
| `new_image`          | Se dispara cuando el robot envía una nueva imagen procesada. | `{ id, timestamp }`                     |
| `ack_received`       | Confirmación de que el robot recibió o completó una acción.  | `{ type, action, state, timestamp }`    |
| `robot_connected`    | Indica que el robot se ha conectado correctamente.           | `{ status: "connected", timestamp }`    |
| `robot_disconnected` | Indica que el robot se ha desconectado.                      | `{ status: "disconnected", timestamp }` |
| `robot_error`        | Se dispara cuando el robot informa un error.                 | `{ type, message, timestamp }`          |

---

### 📅 Próximos pasos / Pendientes de integración

El backend ya implementa la lógica completa para recibir, procesar y notificar eventos en tiempo real mediante **SSE**.

Los próximos pasos para la integración final del sistema son:

1. **🔗 Conexión con el Bridge**
   - Configurar la variable `BRIDGE_URL` en el `.env` con la URL del microservicio intermedio.
   - Probar el flujo completo de mensajes:
     - Del **robot → Bridge → API (/webhook)**.
     - De la **API → Bridge → robot (/command)**.

2. **🧠 Guardado en MongoDB**
   - Persistir los datos que actualmente están simulados en memoria:
     - Logs de errores (`handleError`).
     - Imágenes procesadas (`handleImage`).
     - Comandos enviados (`commands`).

3. **📸 Integración con Cloudflare R2**
   - Verificar la carga real de imágenes desde `handleImage`.
   - Confirmar la correcta creación de URLs públicas.

4. **🖥️ Frontend y panel de control**
   - Escuchar los eventos SSE (`new_image`, `ack_received`, `robot_connected`, etc.).
   - Mostrar notificaciones en tiempo real en el panel de administración y control remoto.

5. **🧪 Pruebas integradas**
   - Realizar pruebas con los microservicios activos simultáneamente.
   - Validar que los flujos y eventos funcionen en ambos sentidos (robot ↔ bridge ↔ API ↔ frontend).

---