export interface UserVoucher {
  id?: number;            
  voucher_id: number;
  user_id: number;
  used_date?: Date | null; 
}
