import Router, { Request, Response } from 'express';
import Comment from '../entities/Comment';
import Post from '../entities/Post';
import User from '../entities/User';
import Vote from '../entities/Vote';
import auth from '../middleware/auth';
import user from '../middleware/user';


// 点赞功能
const vote = async (req: Request, res: Response) => {
    const { identifier, slug, commentIdentifier, value } = req.body;
    // validate vote value
    if (![-1, 0, 1].includes(value)) {
        // 一个人只能有一个点赞，正赞或者倒赞
        return res.status(400).json({ value: 'Value must be -1. 0 or 1' });
    }
    try {
        const user: User = res.locals.user;
        let post = await Post.findOneOrFail({ identifier, slug });
        let vote: Vote | undefined;
        let comment: Comment | undefined;
        if (commentIdentifier) {
            // 该评论下有vote
            comment = await Comment.findOneOrFail({ identifier: commentIdentifier });
            vote = await Vote.findOne({user, comment});
        } else {
            // 如果没有commentIdentifier 找user在这个post中的comment
            // Find vote by the post
            vote = await Vote.findOne({ user, post });
        }

        if (!vote && value === 0) {
            // if no vote and value === 0 return error
            // There is no vote to reset
            return res.status(404).json({error: 'Vote not found'});
        } else if (!vote) {
            // 如果没有vote， 则创建一个vote
            vote = new Vote({ user, value });
            if (comment) vote.comment = comment;
            else vote.post = post;
            await vote.save();
        } else if(value === 0){
            // 更新在数据库存在的vote
            // if vote exists and value === 0, remove vote from DB
            await vote.remove();
        } else if(vote.value !== value){
            // If vote and value has changed, update vote
            vote.value = value;
            await vote.save();
        }

        post = await Post.findOneOrFail({ identifier, slug },
            { relations: ['comments', 'comments.votes','sub', 'votes'] });
        
        post.setUserVote(user);
        post.comments.forEach(c => c.setUserVote(user));
        return res.json(post);
    } catch (error) {

        console.log(error);
        return res.status(500).json({error: 'Error happend at misc.ts'});
    }
}

const router = Router();
router.post('/vote', user, auth, vote);
export default router;