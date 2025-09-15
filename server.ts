import express from 'express';
import dotenv from 'dotenv';
import userRouter from './src/routers/user';
import productRouter from './src/routers/product'
import orderRouter from './src/routers/order'
import addressRouter from './src/routers/address'
import { Request, Response } from 'express';

import { errorHandler } from './src/middlewares/errorHandler';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/product', productRouter);
app.use('/api/order', orderRouter);
app.use('/api/address', addressRouter);

app.use(errorHandler);
app.use((req: Request, res: Response) => {
    return res.status(404).send({ message: "Route not found" });
})
app.use((err: any, req: Request, res:Response) => {
    return res.status(500).send({ message: "Something went wrong!" });
})
app.listen(process.env.PORT, () => {
    console.log(`Server is running in  http://localhost:${process.env.PORT}`);
})