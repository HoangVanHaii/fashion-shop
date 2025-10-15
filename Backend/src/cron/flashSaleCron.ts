import cron from "node-cron";
import { connectionDB } from "../config/database";

cron.schedule("*/2 * * * *", async () => {
    try {
        const pool = await connectionDB();
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
    } catch (err) {
        console.error("[CRON ERROR] Failed to update flash sales", err);
    }
});
