import { Request, Response, Router } from "express";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import auth from '../middleware/auth';


const createPost = async (req: Request, res: Response) => {
    const { title, body, sub } = req.body;
    const user = res.locals.user;
    if(title.trim() === ''){
        return res.status(400).json({ title: 'Title must not be empty' });
    }

    try {
         // 找到订阅
        // 不作errorhandle 是因为这里只会出现因为API而导致额的错误
        const subRecord = await Sub.findOneOrFail({name: sub});
        console.log(subRecord);
        
        const post = new Post({ title, body, user, sub: subRecord });
        await post.save();

        return res.json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Wrong'})
    }
}

const router = Router();
router.post('/', auth, createPost);
export default router;