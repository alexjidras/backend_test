"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/posts', routes_1.postRouter);
app.use('*', (req, res) => {
    return res.status(404).end();
});
app.use((err, req, res, next) => {
    var _a;
    console.error('Error >>:', err);
    return res.status((_a = err.status) !== null && _a !== void 0 ? _a : 500).end(err.message);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map