import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  try {
    res.sendStatus(200);

    console.log('BODY DESDE WEBHOOK:', req.body);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

export default router;
