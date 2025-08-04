import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true , limit:"14kb"}));
app.use(express.static("public"));
app.use((cookieParser)());

// routes import
import userRouter from './routes/user.routes.js'

// routes decleration
app.use('/api/v1/user' , userRouter);

// http://localhost:3000/api/v1/user/register


export default app;