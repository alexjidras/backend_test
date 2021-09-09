import { Router } from 'express';
import axios from 'axios';

import { db } from '../db';
import { Post } from '../types';

const router = Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
    let remotePosts = [];
    const localPosts = db.data?.posts ?? [];
    try {
        remotePosts = await axios.get('https://jsonplaceholder.typicode.com/posts', {
            timeout: 5000
        }).then((res) => res.data);
    } catch(err) {
        console.error(err);
    }

    const allPosts = [...localPosts, ...remotePosts];

    const filters = [];

    for (let filter of ['title', 'body']) {
        if (typeof req.query[filter] === 'string') {
            filters.push(filter);
        }
    }

    if (!filters.length) {
        return res.send(allPosts);
    }
    
    return res.send(allPosts.filter((post) => filters.every((filter) => (
        post[filter].indexOf(req.query[filter]) !== -1
    ))));
});

router.get('/:postId', async (req, res, next) => {
    const localPosts = db.data?.posts ?? [];

    let post = localPosts.find((item) => item.id === +req.params.postId);
    if (post) {
        return res.send(post);
    }

    try {
        const remotePosts = await axios.get('https://jsonplaceholder.typicode.com/posts', {
            timeout: 5000
        }).then((res) => res.data);
        post = remotePosts.find((item) => item.id === +req.params.postId);
        if (post) {
            return res.send(post);
        }
    } catch(err) {
        return next(err);
    }

    return res.status(404).end(); 
});

router.post('/', (req, res, next) => {
    if (!req.body) {
        return res.status(400).end();
    }
    const newPost = {
        ...req.body,
        id: 100 + db.data.posts.length + 1
    };

    if (typeof newPost?.userId === 'undefined' || newPost?.userId === null) {
        return res.status(400).end(`Field 'userId' is required`);
    }

    if (typeof newPost?.userId !== 'number') {
        return res.status(400).end(`Field 'userId' should be a number`);
    }

    if (typeof newPost?.title === 'undefined' || newPost?.title === null) {
        return res.status(400).end(`Field 'title' is required`);
    }

    if (typeof newPost?.title !== 'string') {
        return res.status(400).end(`Field 'title' should be a string`);
    }

    if (typeof newPost?.body === 'undefined' || newPost?.body === null) {
        return res.status(400).end(`Field 'body' is required`);
    }

    if (typeof newPost?.body !== 'string') {
        return res.status(400).end(`Field 'body' should be a string`);
    }
    
    db.data.posts.push(newPost);

    return res.send(newPost);
});

router.patch('/:postId', async (req, res, next) => {
    if (!req.body) {
        return res.status(400).end();
    }

    const { userId, title, body } = req.body;

    const oldPostIdx = db.data.posts.findIndex((item) => item.id === +req.params.postId);
    let oldPost = db.data.posts[oldPostIdx];
    let fromRemote = !oldPost;

    const updatedPost: Partial<Post> = { ...oldPost };

    if (typeof userId !== 'undefined' && userId !== null) {
        if (typeof userId !== 'number') {
            return res.status(400).end(`Field 'userId' should be a number`);
        }
        updatedPost.userId = userId;
    }

    if (typeof title !== 'undefined' && title !== null) {
        if (typeof title !== 'string') {
            return res.status(400).end(`Field 'title' should be a string`);
        }
        updatedPost.title = title;
    }

    if (typeof body !== 'undefined' && body !== null) {
        if (typeof body !== 'string') {
            return res.status(400).end(`Field 'body' should be a string`);
        }
        updatedPost.body = body;
    }
    
    if (fromRemote) {
        try {
            const updatedPostFromRemote = await axios.patch(
                `https://jsonplaceholder.typicode.com/posts/${req.params.postId}`,
                updatedPost,
                {
                    timeout: 5000
                }
            ).then((res) => res.data);
            return res.send(updatedPostFromRemote);
        } catch(err) {
            return res.status(err.response?.status ?? 500).end(err.response?.data);
        }
    }

    db.data.posts.splice(oldPostIdx, 1, updatedPost as Post);
    return res.send(updatedPost);
});

router.delete('/:postId', async (req, res, next) => {
    const deletedPostIdx = db.data.posts.findIndex((item) => item.id === +req.params.postId);
    const deletedPost = db.data.posts[deletedPostIdx];
    if (deletedPostIdx !== -1) {
        db.data.posts.splice(deletedPostIdx, 1);
        return res.send(deletedPost);
    }

    try {
        const deletedPostFromRemote = await axios.patch(
            `https://jsonplaceholder.typicode.com/posts/${req.params.postId}`,
            {},
            {
                timeout: 5000
            }
        ).then((res) => res.data);
        return res.send(deletedPostFromRemote);
    } catch(err) {
        return res.status(err.response?.status ?? 500).end(err.response?.data);
    }
});

export default router;