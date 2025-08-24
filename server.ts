import express from 'express';
import dotenv from 'dotenv';
import userRouter from './src/routers/user';
import product from './src/routers/product'

dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/product', product)

app.listen(process.env.PORT, () => {
    console.log(`Server is running in  http://localhost:${process.env.PORT}`);
})