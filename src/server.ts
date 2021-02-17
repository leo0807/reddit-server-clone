import "reflect-metadata";
import {createConnection} from "typeorm";
import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import postRoutes from './routes/post';
import subsRoutes from './routes/sub';
import miscRoutes from './routes/misc';

import trim from './middleware/trim';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(trim);
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200, // request被发送之前的状态 optional
}));

app.get('/', (_, res) => res.send('TEST'));
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/subs', subsRoutes);
app.use('/api/misc', miscRoutes);

app.listen(process.env.PORT, async () => {
    console.log(`Server is running at${process.env.PORT}`);
    try {
        await createConnection();
        console.log('Database connected!');
    } catch (error) {
        console.log(error);
    }
})