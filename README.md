# 🤖 Backend – Inter-Carreras 

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
│ ├─ libs/
│ │ └─ validator.js
│ ├─ routes/
│ │ ├─ commands.routes.js → /api/robot/command
│ │ ├─ sensors.routes.js → /api/sensors/data
│ │ ├─ status.routes.js → /api/status
│ │ ├─ images.routes.js → /api/robot/image
│ │ └─ webhook.routes.js → /api/webhook
│ ├─ models/
│ │ └─ Image.js → Esquema de imágenes en MongoDB
│ ├─ config.js → Configuración y variables de entorno
│ └─ server.js → Servidor principal Express
├─ .env.example → Variables de entorno de ejemplo
├─ package.json → Dependencias del proyecto
└─ README.md → Documentación técnica

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

### La API quedará disponible en:

🔗 http://localhost:3000

🌐 Endpoints Principales (API REST)

### 🚀 Comandos

POST	/api/robot/command ---> Envía un comando al robot a través del Bridge.

Body de ejemplo:

```json
{
  "robotId": "robot-demo",
  "source": "web_rc",
  "task": "move_forward",
  "value": 10
}
```

GET	/api/robot/command ---> Devuelve el historial de comandos enviados.

### 📡 Sensores

POST	/api/sensors/data	---> Recibe lecturas del sensor ultrasónico o similares.

### ⚙️ Estado del Robot

GET	/api/status	---> Devuelve el último estado conocido del robot.
POST	/api/status/update ---> Actualiza el estado (para pruebas locales).
GET	/api/status/stream ---> Envío en tiempo real (SSE).

### 🖼️ Imágenes

POST	/api/robot/image ---> Registra información de una imagen en MongoDB.
GET	/api/robot/image ---> Lista todas las imágenes registradas en la BD.

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

POST	/api/webhook	---> Recibe datos desde el Bridge (por ejemplo, imágenes o lecturas).

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

Las imágenes se almacenan en Cloudflare R2, y la URL pública se guarda en MongoDB Atlas.
No es necesaria conexión directa del backend con Cloudflare, ya que los frontends leen las URLs desde la BD.

### ☁️ Despliegue

### 🔧 Configuración en la nube

Puede implementarse en Render, Railway, Vercel u otras plataformas.
Solo es necesario configurar las mismas variables de entorno del archivo .env.

### 🖥️ Dashboard y Control Remoto

Las interfaces web se comunican con esta API a través de los endpoints REST:

El control remoto envía acciones mediante /api/robot/command.

El panel de administración consulta /api/robot/image y /api/status para mostrar el estado e imágenes registradas.

La API funciona como puente entre el microservicio Bridge (MQTT) y los frontends web, garantizando una comunicación fluida y centralizada.

---