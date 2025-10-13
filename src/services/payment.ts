import { connectionDB } from "../config/database"
import { AppError } from "../utils/appError"
export const updatePaymentStatus = async (orderId: string, status: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const query = `UPDATE payments SET status = @status WHERE order_id IN (${orderId})`;
        await pool.request()
            .input('status', status)
            .query(query);
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to update payment status', 500, false);
    }
}
