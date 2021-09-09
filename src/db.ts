import { Post } from './types';

interface Data {
    posts: Post[]
}

interface Db {
    data: Data
}

const db: Db = {
    data: {
        posts: []
    }
}

export { db };
