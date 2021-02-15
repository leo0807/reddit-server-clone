import "reflect-metadata";
import {createConnection} from "typeorm";
import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import postRoutes from './routes/post';
import subsRoutes from './routes/sub';
import trim from './middleware/trim';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(trim);
app.use(cookieParser());

app.get('/', (req, res) => res.send('TEST'));
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/subs', subsRoutes);

app.listen(process.env.PORT, async () => {
    console.log(`Server is running at${process.env.PORT}`);
    try {
        await createConnection();
        console.log('Database connected!');
    } catch (error) {
        console.log(error);
    }
})