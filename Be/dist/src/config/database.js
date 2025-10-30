"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};
const connectionDB = async () => {
    try {
        let pool = await mssql_1.default.connect(config);
        console.log('Kết nối database thành công');
        return pool;
    }
    catch (err) {
        console.error(err.message);
        console.log("Không thể kết nối database");
        throw err;
    }
};
exports.connectionDB = connectionDB;
