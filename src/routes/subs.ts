import { NextFunction, Request, Response, Router } from "express";
import { isEmpty } from 'class-validator';
import User from "../entities/User";
import Sub from "../entities/Sub";
import {getRepository} from 'typeorm';
import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../util/helpers";
import path from "path";
import fs from 'fs';
const createSub = async (req: Request, res: Response) => {
    
    const { name, title, description } = req.body;
    const user: User = res.locals.user;
    try {
        let errors: any = {};
        if (isEmpty(name)) errors.name = 'Name must not be empty';
        if (isEmpty(title)) errors.Title = 'Title must not be empty';

        const sub = await getRepository(Sub)
        .createQueryBuilder('sub') // sub是此SQL语句的别名  
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
const getSubs = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });

    //Sub was found, and now fetch data
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    sub.posts = posts;

    //Validate if posts is from user logged
    if (res.locals.user) {
      sub.posts.forEach((e) => {
        e.setUserVote(res.locals.user);
      });
    }

    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ sub: "Sub not found" });
  }
};
const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;
    try {
        const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });
        if (sub.username !== user.username) {
            // 没有权限
            return res.status(403).json({ error: 'You dont own this sub' });
        }
        res.locals.sub = sub;
        return next();
    } catch (err) {
        return res.status(500).json({error: 'Error happend at ownSub'})
    }
}

const upload = multer({
    storage: multer.diskStorage({
        destination: 'public/images',
        filename: (_, file, callback) => {
            const name = makeId(15);
            callback(null, name + path.extname(file.originalname)); //e.g. 455tyg67 + jpg/png
        }
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {
        // check file is an image
        if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
            callback(null, true);
        } else {
            callback(new Error('File not an image'));
        }
    }
})

const uploadSubImage = async (req: Request, res: Response) => {
    const sub = res.locals.sub;
    try {
        const type = req.body.type;
        if (type !== 'image' && type !== 'banner') {
            fs.unlinkSync(req.file!.path);
            return res.status(400).json({ error: 'Invalid type' });
        }
        // 只保留一个image，删除旧的image
        // check image是banner类型或是image
        console.log(type)
        let oldImageUrn = '';
        if (type === 'image') {
        oldImageUrn = sub.imageUrn || '';
        sub.imageUrn = req.file!.filename;
        } else if (type === 'banner') {
        oldImageUrn = sub.bannerUrn || '';
        sub.bannerUrn = req.file!.filename;
        }

        await sub.save();

        if (oldImageUrn !== '') {
        fs.unlinkSync(`public//images//${oldImageUrn}`);
        }
        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
}
const searchSubs = async (req: Request, res: Response) => {
    try {
        const name = req.params.name;
        if (isEmpty(name)) {
            return res.status(400).json({ error: 'Name must not be empty'});
        }
        const subs = await getRepository(Sub)
            .createQueryBuilder()
            .where('LOWER(name) LIKE :name', { name: `%${name.toLowerCase().trim()}%` })
            .getMany();
        return res.json(subs);
    } catch (err) {
        return res.status(500).json({ error: 'Something went wrong at searchSubs' });
    }
};

const router = Router();
router.post('/', user, auth, createSub);
router.get('/:name', user, getSubs);
router.get('/search/:name', searchSubs);
router.post('/:name/image', user, auth, ownSub, upload.single('file'), uploadSubImage);
export default router;