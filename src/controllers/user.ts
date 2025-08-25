import { Request, Response } from "express";
import { User } from "../interfaces/user";
import * as userSercice from "../services/user";
import * as utils from "../utils/sendOTP";
import * as otpService from "../services/otp";
import * as jwtUtils from "../utils/jwt"
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body as User;
        
        const existingUser = await userSercice.getUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ message: "Email already exists" });
            return;
        }   
        
        await userSercice.registerUser({email, name, password, role} as User);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const issent = await utils.sendOtp(email, otp);
        
        if (issent) {
            await otpService.saveOtp(email, otp);
            res.status(200).json({ message: "OTP has been sent to your email. Please verify it." });
        }
        else {
            res.status(500).json({ message: "Failed to send OTP" });
        }

    } catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("RegisterUser controller error:", message);

        res.status(status).json({ message: message });
    }
}
export const verifyRegisterUser = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const isValid = await otpService.verifyOtp(email, otp);
        
        if (!isValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        
        await userSercice.verifyUser(email);

        res.status(200).json({ message: "Account registration successful" });

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("verifyRegisterUser controller error:", message);
        
        status(500).json({ message: message });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await userSercice.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Login success",
            data: result
        });
        
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("loginUser controller: ", message);
        
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        jwt.verify(refreshToken, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired refresh token" });
            }
            const newAccessToken = jwtUtils.accessToken(user.id, user.email, user.role);

            return res.status(200).json({
                accessToken: newAccessToken
            })
        } )

    } catch (err : any) {
        console.error("refreshToken controller error: ", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = req.user?.id;

        const user = await userSercice.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);


    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("getUserById controller error:", message);
        return res.status(status).json({ message: message });
    }
}


// export const updateUser = async (req: Request, res: Response) => {
//     try {
        
//     } catch (err) {
        
//     }



// }
