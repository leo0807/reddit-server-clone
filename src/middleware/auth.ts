import { NextFunction, Request, Response } from "express";
import User from '../entities/User';

export default async (_: Request, res: Response, next: NextFunction) => {
    try {
        const user: User | undefined = res.locals.user;
        if (!user) throw new Error('Unauthenticated');
        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: 'Unauthenticated' });
    }
}

// 将用户登陆态中间件分为两部分，是为了有些情况，不需要用户登陆也可以使用