export const handleSign = (sign) => {
  let command = null;
  switch (sign) {
    case 'Avanzar':
      command = {
        type: 'move',
        content: { direction: 'forward', time: 2000 }
      };
      break;
    case 'Retroceder':
      command = {
        type: 'move',
        content: { direction: 'backward', time: 2000 }
      };
      break;
    case 'Detener':
      command = { type: 'stop' };
      break;
    case 'Izquierda':
      command = {
        type: 'turn',
        content: { direction: 'left', time: 500 }
      };
      break;
    case 'Derecha':
      command = {
        type: 'turn',
        content: { direction: 'right', time: 500 }
      };
      break;
    case 'Iniciar':
      command = [
        { commandType: 'move', content: { direction: 'forward', time: 500 } },
        { commandType: 'turn', content: { direction: 'right', time: 200 } },
        { commandType: 'move', content: { direction: 'forward', time: 300 } },
        { commandType: 'turn', content: { direction: 'left', time: 500 } },
        { commandType: 'lift', content: { direction: 'up', time: 2000 } },
        { commandType: 'move', content: { direction: 'backward', time: 500 } },
        { commandType: 'turn', content: { direction: 'left', time: 200 } },
        { commandType: 'move', content: { direction: 'forward', time: 1000 } },
        { commandType: 'lift', content: { direction: 'down', time: 2000 } }
      ];
      break;
    default:
      command = null;
      break;
  }

  return command;
};
