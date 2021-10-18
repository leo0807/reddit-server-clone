import { Request, Response, Router } from "express";
import User from "../entities/User";
import { isEmpty, validate } from 'class-validator'; //Validation 检查
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import auth from '../middleware/auth';
import user from '../middleware/user';

const mappedErrors = (errors: Object[]) => {
    // let mappedErrors:any = {};
    // errors.forEach((e: any) => {
    //     const key = e.property;
    //     const value = Object.entries(e.constraints)[0][1];
    //     mappedErrors[key] = value;
    // });

    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1];
        return prev;
    }, {});
}

const register = async (req: Request, res:Response) => {
    const { username, password, email } = req.body;
    try {
        // 验证数据
        let errors: any = {};
        const emailUser = await User.findOne({ email });
        const usernameUser = await User.findOne({ username });
        if (emailUser) errors.email = 'Email is already taken';
        if (usernameUser) errors.username = 'Username is already taken';
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }
        // Create User
        const user = new User({ username, password, email });
        errors = await validate(user);
        if (errors.length > 0) {
            return res.status(400).json(mappedErrors(errors));
        }
        await user.save(); //将user存入数据库

        // Return the user
        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        let errors: any = {};
        if (isEmpty(username)) errors.username = 'Username must not empty';
        if (isEmpty(password)) errors.password = 'Password must not empty';
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ errors: 'User not found' });

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ password: 'Password Incorrect' });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET!);
        // token是cookie的名字
        res.set('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true, // 不可被JS访问
            secure: process.env.NODE_ENV === 'production', // 如果为true，只在HTTPS的情况下使用
            sameSite: 'strict', // cookie只能用于此domain
            maxAge: 3600,
            path: '/' //cookie 验证的路径 ，这里是整个app都可以用 ，没有这项的话则只在/auth/login是合法的
        }));

        return res.json(user);
    } catch (error) {
        return res.status(500).json({ error: `Something in the login func, where u & p are ${username} ${password}` });
    }
}

// 返回给用户验证状态,是否验证成功
const me = (_: Request, res: Response) => {
    return res.json(res.locals.user);
}
// 重置cookie
const logout = (_: Request, res: Response) => {
    res.set('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0), //立即失效
        path: '/' //cookie 验证的路径 ，这里是整个app都可以用 ，没有这项的话则只在/auth/login是合法的
    }));
    return res.status(200).json({ success: true });
}


const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', user, auth, me); // auth作中间件
router.get('/logout', user, auth, logout);
export default router;
