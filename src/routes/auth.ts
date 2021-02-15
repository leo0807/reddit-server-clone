import { json, Request, Response, Router } from "express";
import User from "../entities/User";
import { isEmpty, validate } from 'class-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import auth from '../middleware/auth';
const register = async (req: Request, res:Response) => {
    const { username, password, email } = req.body;
    try {
        const user = new User({ username, password, email });

        // 验证数据
        let errors: any = {};
        const emailUser = await User.findOne({ email });
        const usernameUser = await User.findOne({ username });
        if (emailUser) errors.email = 'Email is already taken';
        if (usernameUser) errors.username = 'Username is already taken';
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }
        errors = await validate(user);
        if (errors.length > 0) return res.status(400).json({ errors  });
        await user.save();

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

        const token = jwt.sign({ username }, process.env.JWT_ACCESS_TOKEN!);
        res.set('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/' //cookie 验证的路径 ，这里是整个app都可以用 ，没有这项的话则只在/auth/login是合法的
        }));
        return res.json(user);
    } catch (error) {
        console.log(error);
        
    }
}

// 返回给用户验证状态,是否验证成功
const me = (req: Request, res: Response) => {
    return res.json(res.locals.user);
}

const logout = (req: Request, res: Response) => {
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
router.post('/me', auth,me);
router.post('/logout', auth,logout);
export default router;
