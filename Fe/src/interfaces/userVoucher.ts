export interface UserVoucher {
    id?: number;
    voucher_id: number;
    user_id: number;
    used_date?: Date | null;
}
export interface UserVoucherDetail {
    id: number;
    voucher_id: number;
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    start_date: Date;
    end_date: Date;
    used_date: Date | null;
  }
  