import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
import { connectionDB } from './src/config/database';
import { Request, Response } from 'express';
app.get('/test-db', async (req: Request, res: Response) => {
    try {
        const pool = await connectionDB();
        res.json({
            message: 'Kết nối DB thành công!',
        });
    } catch (err: any) {
        res.status(500).json({
            message: 'Lỗi kết nối DB',
            error: err.message
        });
    }
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running in  http://localhost:${process.env.PORT}`);
})