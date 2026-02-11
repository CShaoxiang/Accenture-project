import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import venueRoutes from './routes/venue.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Event routes
app.use('/api/v1/events', eventRoutes);

// Venue routes
app.use('/api/v1/venues', venueRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
