var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import axios from 'axios';
import { db } from './db';
const PORT = 3000;
const app = express();
app.use(express.json());
app.get('/posts', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let remotePosts = [];
    const localPosts = (_b = (_a = db.data) === null || _a === void 0 ? void 0 : _a.posts) !== null && _b !== void 0 ? _b : [];
    try {
        remotePosts = yield axios.get('https://jsonplaceholder.typicode.com/posts', {
            timeout: 5000
        }).then((res) => res.data);
    }
    catch (err) {
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
    return allPosts.filter((post) => filters.every((filter) => (post[filter].indexOf(req.query[filter]) !== -1)));
}));
app.get('/posts/:postId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const localPosts = (_d = (_c = db.data) === null || _c === void 0 ? void 0 : _c.posts) !== null && _d !== void 0 ? _d : [];
    let post = localPosts.find((item) => item.id === +req.params.postId);
    if (post) {
        return res.send(post);
    }
    try {
        const remotePosts = yield axios.get('https://jsonplaceholder.typicode.com/posts', {
            timeout: 5000
        }).then((res) => res.data);
        post = remotePosts.find((item) => item.id === +req.params.id);
        if (post) {
            return res.send(post);
        }
    }
    catch (err) {
        return next(err);
    }
    return res.status(404).end();
}));
app.post('/posts', (req, res, next) => {
    if (!req.body) {
        return res.status(400).end();
    }
    const newPost = Object.assign(Object.assign({}, req.body), { id: db.data.posts.length + 1 });
    if (typeof (newPost === null || newPost === void 0 ? void 0 : newPost.userId) === 'undefined' || (newPost === null || newPost === void 0 ? void 0 : newPost.userId) === null) {
        return res.status(400).end(`Field 'userId' is required`);
    }
    if (typeof (newPost === null || newPost === void 0 ? void 0 : newPost.userId) !== 'number') {
        return res.status(400).end(`Field 'userId' should be a number`);
    }
    if (typeof (newPost === null || newPost === void 0 ? void 0 : newPost.title) === 'undefined' || (newPost === null || newPost === void 0 ? void 0 : newPost.title) === null) {
        return res.status(400).end(`Field 'title' is required`);
    }
    if (typeof (newPost === null || newPost === void 0 ? void 0 : newPost.title) !== 'string') {
        return res.status(400).end(`Field 'title' should be a string`);
    }
    if (typeof (newPost === null || newPost === void 0 ? void 0 : newPost.body) === 'undefined' || (newPost === null || newPost === void 0 ? void 0 : newPost.body) === null) {
        return res.status(400).end(`Field 'body' is required`);
    }
    if (typeof (newPost === null || newPost === void 0 ? void 0 : newPost.body) !== 'string') {
        return res.status(400).end(`Field 'body' should be a string`);
    }
    db.data.posts.push(newPost);
    return res.send(newPost);
});
app.use('*', (req, res) => {
    return res.status(404).end();
});
app.use((err, req, res, next) => {
    console.error('Error >>:', err);
    return res.status(500).end();
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map