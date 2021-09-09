import { Low, Memory } from 'lowdb';
const db = new Low(new Memory());
db.data || (db.data = {
    posts: []
});
export { db };
//# sourceMappingURL=db.js.map