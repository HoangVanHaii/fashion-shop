import { Request, Response } from "express";
import * as userSercice from "../services/user";
import { User } from "../interfaces/user";
import * as utils from "../utils/sendOTP";

let userTmp: User | null = null;

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body as User;
        
        if (!email || !name || !password) {
            res.status(400).json({ message: "Vui lòng nhập đầy đủ!" });
            return;
        }
        const existingUser = await userSercice.getUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ message: "Email đã tồn tại" });
            return;
        }   
        
        await userSercice.registerUser({email, name, password, role} as User);
        
        const issent = await utils.sendOtp(email);
        if (issent) {
            res.status(200).json({ message: "OTP đã gửi đến Email của bạn. Vui lòng xác nhận" });
        }
        else {
            res.status(500).json({ message: "Gửi OTP thất bại!" });
        }

    } catch (err : any) {
        console.error("Lỗi controller registerUser:", err.message);
        if (err.status) {
            res.status(err.status).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Lỗi server" });
    }
}
export const verifyRegisterUser = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
            return;
        }
        const isValid = await utils.verifyOtp(email, otp);
        
        if (!isValid) {
            return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
        }
        
        await userSercice.verifyUser(email);

        res.status(200).json({ message: "Đăng ký tài khoản thành công!" });

    } catch (err : any) {
        console.error("Lỗi xác nhận đăng ký user!", err.message);
        if (err.status) {
            res.status(err.status).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Lỗi xác nhận đăng ký!" });
    }
}

// export const login = 