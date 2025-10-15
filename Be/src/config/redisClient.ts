import { createClient } from "redis";
import dotenv from 'dotenv';
import { AppError } from "../utils/appError";

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    } catch (err:any) {
        if (err instanceof AppError) {
            throw err;
        }
        console.error(" Failed to connect to Redis:", err);
        throw new AppError(err.message, 500, false);
    }
})();

export default redisClient;
