import { Request, Response, Router } from "express";
import { isEmpty } from 'class-validator';
import User from "../entities/User";
import Sub from "../entities/Sub";
import {getRepository} from 'typeorm';
import auth from "../middleware/auth";
import user from "../middleware/user";

const createSub = async (req: Request, res: Response) => {
    
    const { name, title, description } = req.body;
    const user: User = res.locals.user;
    try {
        let errors: any = {};
        if (isEmpty(name)) errors.name = 'Name must not be empty';
        if (isEmpty(title)) errors.Title = 'Title must not be empty';

        const sub = await getRepository(Sub)
            .createQueryBuilder('sub')
            .where('lower(sub.name) = :name', { name: name.toLowerCase() })
            .getOne();
        if (sub) errors.name = 'Sub existed already';
        if (Object.keys(errors).length > 0) {
            throw errors
        }
    } catch (error) {
        return res.status(400).json(error);
    }

    try {
        const sub = new Sub({ name, description, user, title });
        await sub.save();

        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
        
    }
}


const router = Router();
router.post('/', user, auth, createSub);
export default router;