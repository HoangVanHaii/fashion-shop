import { connectionDB } from "../config/database";

export const saveOtp = async (email: string, otp: string): Promise<void> => {
  const pool = await connectionDB();
  await pool.request().input("email", email).query(`DELETE FROM otp_codes
            WHERE email = @email`);

  await pool.request().input("email", email).input("otp", otp)
    .query(`INSERT INTO otp_codes (email, otp, expires_at)
            VALUES(@email, @otp, DATEADD(MINUTE, 5, GETDATE()))`);
  console.log(email, otp);
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
    console.error("Lỗi xác thực OTP:", err.message);
    throw new Error("Lỗi xác thực OTP");
  }
};
