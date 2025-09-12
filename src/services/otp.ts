import { connectionDB } from "../config/database";
import { AppError } from "../utils/appError";

export const saveOtp = async (email: string, otp: string): Promise<void> => {
  try {
    const pool = await connectionDB();
    await pool.request().input("email", email).query(`DELETE FROM otp_codes
              WHERE email = @email`);
  
    await pool.request().input("email", email).input("otp", otp)
      .query(`INSERT INTO otp_codes (email, otp, expires_at)
              VALUES(@email, @otp, DATEADD(MINUTE, 5, GETDATE()))`);
    
  } catch (err : any) {
    throw new AppError("Failed to saveOtp", 500, false);
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const pool = await connectionDB();
    const result = await pool.request().input("email", email).input("otp", otp)
      .query(`SELECT email
                    FROM otp_codes
                    WHERE(email = @email
                    AND otp = @otp
                    AND expires_at > GETDATE())`);

    if (result.recordset.length > 0) {
      await pool.request().input("email", email).query(`DELETE FROM otp_codes
                WHERE email = @email`);

      return true;
    }
    return false;
  } catch (err: any) {
    throw new AppError("Failed to verifyOtp", 500, false);
  }
};
