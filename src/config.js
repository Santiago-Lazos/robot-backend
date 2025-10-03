import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  mqttUrl: process.env.MQTT_BROKER_URL,
  mqttTopicControl: process.env.MQTT_TOPIC_CONTROL || 'equipo2/robot/control',
  mqttTopicState: process.env.MQTT_TOPIC_STATE || 'equipo2/robot/estado',
  mongoUri: process.env.MONGO_URI
};
