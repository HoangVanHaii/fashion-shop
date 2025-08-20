import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();
const config = {
    user: process.env.dbUser,
    password: process.env.dbPassword,
    server: process.env.dbServer,
    database: process.env.dbDatabase,
    port: 1433,
    options: {
        trustServerCertificate:true
    }
}

export const connectionDB = async () => {
    try {
        let pool = await mssql.connect(config);
        console.log('ket noi database thanh cong');
        return pool;
    }
    catch (err) {
        console.error(err.message);
        console.log("Không thể kết nối database");
        throw err;
    }
}