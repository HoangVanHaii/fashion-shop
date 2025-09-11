import express from 'express';
import dotenv from 'dotenv';
import userRouter from './src/routers/user';
import productRouter from './src/routers/product'
import orderRouter from './src/routers/order'

import { errorHandler } from './src/middlewares/errorHandler';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/product', productRouter)
app.use('/api/order', orderRouter)

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running in  http://localhost:${process.env.PORT}`);
})