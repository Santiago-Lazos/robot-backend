export const handleSign = (sign) => {
  let command = null;
  switch (sign) {
    /* case 'Avanzar':
      command = {
        type: 'move',
        content: { direction: 'forward', time: 6000 }
      };
      break; */
    case 'Retroceder':
      command = {
        type: 'move',
        content: { direction: 'backward', time: 6000 }
      };
      break;
    case 'Detener':
      command = { type: 'stop' };
      break;
    case 'Izquierda':
      command = {
        type: 'turn',
        content: { direction: 'left', time: 1500 }
      };
      break;
    case 'Derecha':
      command = {
        type: 'turn',
        content: { direction: 'right', time: 1500 }
      };
      break;
    case 'Iniciar':
      command = [
        { commandType: 'move', content: { direction: 'forward', time: 1500 } },
        { commandType: 'turn', content: { direction: 'right', time: 600 } },
        { commandType: 'move', content: { direction: 'forward', time: 900 } },
        { commandType: 'turn', content: { direction: 'left', time: 1500 } },
        { commandType: 'lift', content: { direction: 'up', time: 3000 } },
        { commandType: 'tilt', content: { direction: 'up', time: 500 } },
        { commandType: 'move', content: { direction: 'backward', time: 1500 } },
        { commandType: 'turn', content: { direction: 'left', time: 600 } },
        { commandType: 'move', content: { direction: 'forward', time: 3000 } },
        { commandType: 'lift', content: { direction: 'down', time: 2000 } },
        { commandType: 'tilt', content: { direction: 'down', time: 300 } }
      ];
      break;
    default:
      command = null;
      break;
  }

  return command;
};
