import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { NODE_ENV, ORIGIN, PORT } from './constants/env';
import { OK } from './constants/http';
import connectToDatabase from './config/db';
import errorHandler from './middleware/errorHandler';
import jobRoutes from './routes/job.route';
import userRoutes from './routes/user.route';
import authRoutes from './routes/auth.route';
import { authenticate } from './middleware/authenticate';



const app = express();
const allowedOrigin = [ORIGIN];

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigin.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  credentials: true 
}))

// Test route
app.get('/', (req, res, next) => {
  return res.status(OK).json({
    status: 'Healthy'
  })
})


// ROUTE FOR USER
app.use("/api/auth", authRoutes);

// ROUTE FOR USER
app.use("/api/users", authenticate, userRoutes);

// ROUTE FOR JOBS
app.use("/api/jobs", authenticate, jobRoutes);



// Error Middleware
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
})