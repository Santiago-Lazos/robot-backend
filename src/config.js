import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  mqttUrl: process.env.MQTT_BROKER_URL,
  mqttTopicControl: process.env.MQTT_TOPIC_CONTROL || 'equipo2/robot/control',
  mqttTopicState: process.env.MQTT_TOPIC_STATE || 'equipo2/robot/estado',
  mongoUri: process.env.MONGO_URI,
  openaiApiKey: process.env.OPENAI_API_KEY,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME,
  r2TokenValue: process.env.R2_TOKEN_VALUE,
  r2CdnUrl: process.env.R2_CDN_URL,
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  bridgeUrl: process.env.BRIDGE_URL
};
