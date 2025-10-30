"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const updatePaymentStatus = async (orderId, status) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `UPDATE payments SET status = @status WHERE order_id IN (${orderId})`;
        await pool.request()
            .input('status', status)
            .query(query);
    }
    catch (error) {
        console.log(error);
        throw new appError_1.AppError('Failed to update payment status', 500, false);
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
