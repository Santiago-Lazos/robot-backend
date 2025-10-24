export const handleSign = (sign) => {
  let command = null;
  switch (sign) {
    case 'Avanzar':
      command = { type: 'move', content: { direction: 'forward' } };
      break;
    case 'Retroceder':
      command = { type: 'move', content: { direction: 'backward' } };
      break;
    case 'Detener':
      command = { type: 'stop' };
      break;
    case 'Izquierda':
      command = { type: 'turn', content: { direction: 'left' } };
      break;
    case 'Derecha':
      command = { type: 'turn', content: { direction: 'right' } };
      break;
    case 'Carga':
      command = { type: 'charge', content: {} }; // TODO Carga
      break;
    case 'Descarga':
      command = { type: 'discharge', content: {} }; // TODO Descarga
      break;
    default:
      command = null;
      break;
  }

  return command;
};
