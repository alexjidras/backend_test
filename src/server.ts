import express from 'express';

import { postRouter } from './routes';

const PORT = 3000;
const app = express();

app.use(express.json());

app.use('/posts', postRouter);

app.use('*', (req, res) => {
    return res.status(404).end();
});

app.use((err, req, res, next) => {
    console.error('Error >>:', err);
    return res.status(err.status ?? 500).end(err.message);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});