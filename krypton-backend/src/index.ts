import express from 'express';
import { proveFactoringRoute } from './routes/prove-factoring.js';

const app = express();
app.use(express.json());

app.post('/api/prove-factoring', proveFactoringRoute);

const PORT = process.env.PORT ?? '3001';
app.listen(Number(PORT), () => {
  console.log(`krypton-backend listening on :${PORT}`);
});
