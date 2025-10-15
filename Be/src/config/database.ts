import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: mssql.config = {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    server: process.env.DB_SERVER as string,
    database: process.env.DB_DATABASE as string,
    port: Number(process.env.DB_PORT),

    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export const connectionDB = async () => {
    try {
        let pool = await mssql.connect(config);
        console.log('Kết nối database thành công');
        return pool;
    } catch (err: any) {
        console.error(err.message);
        console.log("Không thể kết nối database");
        throw err;
    }
};


