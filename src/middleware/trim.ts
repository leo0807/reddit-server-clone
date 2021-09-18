import { NextFunction, Request, Response } from 'express';
// 作为中间件，在每一个request body中，去除输入的空格
export default (req: Request, _: Response, next: NextFunction)=>{
    const exceptions = 'password';
    Object.keys(req.body).forEach(key => {
        if (!exceptions.includes(key) && typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim();
        }
    });

    next();
}