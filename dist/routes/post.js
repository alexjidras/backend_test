"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../db");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let remotePosts = [];
    const localPosts = (_b = (_a = db_1.db.data) === null || _a === void 0 ? void 0 : _a.posts) !== null && _b !== void 0 ? _b : [];
    try {
        remotePosts = yield axios_1.default.get('https://jsonplaceholder.typicode.com/posts', {
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
    return res.send(allPosts.filter((post) => filters.every((filter) => (post[filter].indexOf(req.query[filter]) !== -1))));
}));
router.get('/:postId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const localPosts = (_d = (_c = db_1.db.data) === null || _c === void 0 ? void 0 : _c.posts) !== null && _d !== void 0 ? _d : [];
    let post = localPosts.find((item) => item.id === +req.params.postId);
    if (post) {
        return res.send(post);
    }
    try {
        const remotePosts = yield axios_1.default.get('https://jsonplaceholder.typicode.com/posts', {
            timeout: 5000
        }).then((res) => res.data);
        post = remotePosts.find((item) => item.id === +req.params.postId);
        if (post) {
            return res.send(post);
        }
    }
    catch (err) {
        return next(err);
    }
    return res.status(404).end();
}));
router.post('/', (req, res, next) => {
    if (!req.body) {
        return res.status(400).end();
    }
    const newPost = Object.assign(Object.assign({}, req.body), { id: 100 + db_1.db.data.posts.length + 1 });
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
    db_1.db.data.posts.push(newPost);
    return res.send(newPost);
});
router.patch('/:postId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g;
    if (!req.body) {
        return res.status(400).end();
    }
    const { userId, title, body } = req.body;
    const oldPostIdx = db_1.db.data.posts.findIndex((item) => item.id === +req.params.postId);
    let oldPost = db_1.db.data.posts[oldPostIdx];
    let fromRemote = !oldPost;
    const updatedPost = Object.assign({}, oldPost);
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
            const updatedPostFromRemote = yield axios_1.default.patch(`https://jsonplaceholder.typicode.com/posts/${req.params.postId}`, updatedPost, {
                timeout: 5000
            }).then((res) => res.data);
            return res.send(updatedPostFromRemote);
        }
        catch (err) {
            return res.status((_f = (_e = err.response) === null || _e === void 0 ? void 0 : _e.status) !== null && _f !== void 0 ? _f : 500).end((_g = err.response) === null || _g === void 0 ? void 0 : _g.data);
        }
    }
    db_1.db.data.posts.splice(oldPostIdx, 1, updatedPost);
    return res.send(updatedPost);
}));
router.delete('/:postId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k;
    const deletedPostIdx = db_1.db.data.posts.findIndex((item) => item.id === +req.params.postId);
    const deletedPost = db_1.db.data.posts[deletedPostIdx];
    if (deletedPostIdx !== -1) {
        db_1.db.data.posts.splice(deletedPostIdx, 1);
        return res.send(deletedPost);
    }
    try {
        const deletedPostFromRemote = yield axios_1.default.patch(`https://jsonplaceholder.typicode.com/posts/${req.params.postId}`, {}, {
            timeout: 5000
        }).then((res) => res.data);
        return res.send(deletedPostFromRemote);
    }
    catch (err) {
        return res.status((_j = (_h = err.response) === null || _h === void 0 ? void 0 : _h.status) !== null && _j !== void 0 ? _j : 500).end((_k = err.response) === null || _k === void 0 ? void 0 : _k.data);
    }
}));
exports.default = router;
//# sourceMappingURL=post.js.map