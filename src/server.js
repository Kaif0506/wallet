import express from 'express';
import dotenv from "dotenv"
const { sql } = await import('./config/db.js'); // Importing the sql instance from db.js
dotenv.config();
const  app = express();
import ratelimiterMiddleware from './middlewear/rateLimiter.js';
import transactionsRoute from './routes/transactionsRoute.js';

app.use(express.json());
app.use(ratelimiterMiddleware); // Applying the rate limiter middleware

async function connectToDatabase() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS TRANSACTIONS(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        console.log("Database connected and table created successfully.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

app.use('/api/transactions', transactionsRoute);

connectToDatabase().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
});
