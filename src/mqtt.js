import mqtt from 'mqtt';
import EventEmitter from 'events';
import { config } from './config.js';

export const bus = new EventEmitter(); // emite 'state' y 'connected'

const client = mqtt.connect(config.mqttUrl);

client.on('connect', () => {
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

export function publishCommand(command) {
  const msg = JSON.stringify({ command, ts: Date.now() });
  client.publish(config.mqttTopicControl, msg, { qos: 0 });
}
