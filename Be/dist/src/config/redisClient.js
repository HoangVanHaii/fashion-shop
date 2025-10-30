"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const appError_1 = require("../utils/appError");
dotenv_1.default.config();
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    }
    catch (err) {
        if (err instanceof appError_1.AppError) {
            throw err;
        }
        console.error(" Failed to connect to Redis:", err);
        throw new appError_1.AppError(err.message, 500, false);
    }
})();
exports.default = redisClient;
