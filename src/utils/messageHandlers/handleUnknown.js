export const handleUnknown = (body) => {
  console.log('TIPO DE MENSAJE NO IDENTIFICADO:', body);

  return {
    message: 'Tipo de mensaje no identificado',
    body
  };
 /*  console.log("⚠️ Tipo de mensaje desconocido:", body); */
};
