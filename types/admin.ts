export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at?: string;
  is_suspended?: boolean;
  portfolio?: {
    total_balance?: number;
    active_yield_rate?: number;
    pending_allocations?: number;
  };
  latest_otp?: {
    code: string;
    expires_at: string;
    is_used?: boolean;
  };
}
