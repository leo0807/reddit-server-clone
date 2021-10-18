import "reflect-metadata";
import {createConnection} from "typeorm";
import express from 'express';
import morgan from 'morgan';
// 记录所有发送出去的请求

import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import subsRoutes from './routes/subs';
import miscRoutes from './routes/misc';
import userRoutes from './routes/users';

import trim from './middleware/trim';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();
// 使得public中文件被expose，可以被访问
app.use(express.static('public'));
app.use(express.json());
app.use(morgan('dev'));
app.use(trim);
app.use(cookieParser());
app.use(cors({
    credentials: true,
    // origin: process.env.ORIGIN,
    optionsSuccessStatus: 200, // request被发送之前的状态 optional
}));
// npm run typeorm schema:drop
// npm run typeorm migration:generate -- --name create-users-table
// npm run typeorm migration:run
app.get('/', (_, res) => res.send('TEST'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/subs', subsRoutes);
app.use('/api/misc', miscRoutes);
app.use('/api/users', userRoutes);

app.listen(process.env.PORT, async () => {
    console.log(`Server is running at${process.env.PORT || 5000}`);
    try {
        await createConnection();
        console.log('Database connected!');
    } catch (error) {
        console.log(error);
    }
})