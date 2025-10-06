// ===============================
// src/mqtt.js
// ===============================
import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from './config.js';

export const bus = new EventEmitter(); // emite 'state' y 'connected'

const client = mqtt.connect(config.mqttUrl);

client.on('connect', () => {
  console.log('🔗 Conectado al broker MQTT');
  client.subscribe(config.mqttTopicState);
  bus.emit('connected', true);
});

client.on('message', (topic, payload) => {
  if (topic === config.mqttTopicState) {
    try {
      const msg = JSON.parse(payload.toString());
      bus.emit('state', msg);
    } catch {
      bus.emit('state', { raw: payload.toString() });
    }
  }
});

/**
 * Publica un comando al robot
 * Formato: { robotId, source, task, value, timestamp }
 */
export function publishCommand(command) {
  const msg = JSON.stringify({
    robotId: command.robotId,
    source: command.source,
    task: command.task,
    value: command.value,
    timestamp: new Date(),
  });

  client.publish(config.mqttTopicControl, msg, { qos: 0 });
  console.log('📤 Comando publicado MQTT:', msg);
}
