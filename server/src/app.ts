import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config";

const app = express();
const PORT = process.env.PORT ?? 5000;

dotenv.config();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.json({ status: 'OK' });
});

connectDB()
  .then(() => {
    console.log('MongoDB is connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: Error) => console.error('MongoDB Connection Error', err));

export default app;