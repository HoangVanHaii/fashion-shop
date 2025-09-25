import { connectionDB } from "../config/database"
import { AppError } from "../utils/appError"
export const updatePaymentStatus = async (orderId: number, status: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const query = `UPDATE payments SET status = @status WHERE order_id = @order_id`;
        await pool.request()
            .input('order_id', orderId)
            .input('status', status)
            .query(query);
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to update payment status', 500, false);
    }
}
