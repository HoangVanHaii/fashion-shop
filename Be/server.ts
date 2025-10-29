import cors from "cors"
import express from "express";
import dotenv from "dotenv";
import userRouter from "./src/routers/user";
import productRouter from "./src/routers/product";
import orderRouter from "./src/routers/order";
import addressRouter from "./src/routers/address";
import categoryRouter from './src/routers/category'
import categoryAdminRouter from './src/routers/admin/category'
import categorySellerRouter from './src/routers/seller/category'
import cartRouter from "./src/routers/cart";
import adminRouter from "./src/routers/admin/user";
import reviewRouter from "./src/routers/review";
import favouriteRouter from './src/routers/favourite'
import productSellerRouter from "./src/routers/seller/product";
import productAdminRouter from "./src/routers/admin/product";
import orderSellerRouter from "./src/routers/seller/order";
import flashSaleRouter from "./src/routers/flashSale";
import "./src/cron/flashSaleCron";
import paymentRouter from './src/routers/vnpay'
import voucherRouter from './src/routers/voucher'
import { Request, Response } from "express";
import userVoucherRouter from './src/routers/userVoucher'

import { errorHandler } from "./src/middlewares/errorHandler";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/cart", cartRouter);
app.use("/api/admin/product", productAdminRouter);
app.use("/api/seller/product", productSellerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/seller/order", orderSellerRouter);
app.use("/api/address", addressRouter);
app.use('/api/category', categoryRouter);
app.use('/api/admin/category', categoryAdminRouter);
app.use('/api/seller/category', categorySellerRouter);
app.use('/api/favourite', favouriteRouter);
app.use("/api/review", reviewRouter);
app.use("/api/flashSale", flashSaleRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/voucher', voucherRouter);
app.use('/api/userVoucher', userVoucherRouter);

app.use(errorHandler);

app.use((req: Request, res: Response) => {
  return res.status(404).send({ message: "Route not found" });
});
app.use((err: any, req: Request, res: Response) => {
  return res.status(500).send({ message: "Something went wrong!" });
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running in  http://localhost:${process.env.PORT}`);
});
