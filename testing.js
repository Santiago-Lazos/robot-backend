import express from 'express';
import cors from 'cors';


const app = express();
const PORT = 3001

app.use(cors());
app.use(express.json());

// Endpoin debug temporal (para el bridge)
app.post('/api/debug', (req, res) => {
  console.log('📩 [Bridge Debug] Datos recibidos:');
  console.log(JSON.stringify(req.body, null, 2));
  res.json({ message: 'Datos recibidos correctamente (debug)' });
});

app.listen(PORT, () => {
  console.log(`Servidor http://localhost:${PORT}`);
});
