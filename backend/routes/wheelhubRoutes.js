import express from "express";
import { auth } from "../middlewares/auth.js";
import { Post } from "../models/post.model.js";

const router = express.Router();

router.post("/posts", auth, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id

        if (!userId || !content) {
            return res.status(400).json({ message: "User ID and content are required." });
        }

        const newPost = await Post.create({ userId, content });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all posts
router.get("/getposts", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("userId", ["name", "avatar"]) // Populate user details if needed
            .populate("comments.userId", ["name", "avatar"])
            .populate("comments.replies.userId", ["name", "avatar"])
            .exec();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Add a comment to a post
router.post("/posts/:postId/comments", auth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;


        if (!userId || !content) {
            return res.status(400).json({ message: "User ID and content are required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        post.comments.push({ userId, content });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Add a reply to a comment
router.post("/posts/:postId/comments/:commentId/replies", auth, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!userId || !content) {
            return res.status(400).json({ message: "User ID and content are required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        comment.replies.push({ userId, content });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;  
