import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: mssql.config = {
    user: process.env.dbUser as string,
    password: process.env.dbPassword as string,
    server: process.env.dbServer as string,
    database: process.env.dbDatabase as string,
    port: 1433,
    options: {
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
