"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
node_cron_1.default.schedule("*/2 * * * *", async () => {
    try {
        const pool = await (0, database_1.connectionDB)();
        await pool.request().query(`
      UPDATE flash_sales
      SET status = 'active'
      WHERE status = 'pending'
        AND start_date <= GETDATE()
        AND end_date > GETDATE()
    `);
        await pool.request().query(`
      UPDATE flash_sales
      SET status = 'ended'
      WHERE status = 'active'
        AND end_date <= GETDATE()
    `);
        await pool.request().query(`
        UPDATE flash_sale_items
        SET status = 'removed' 
        WHERE flash_sale_id IN (
            SELECT id 
            FROM flash_sales
            WHERE status = 'Cancelled' 
        )
        AND status <> 'removed'
    `);
        console.log(`[CRON] Flash sales status updated at ${new Date().toISOString()}`);
    }
    catch (err) {
        console.error("[CRON ERROR] Failed to update flash sales", err);
    }
});
