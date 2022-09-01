export interface PreOrderResponse {
  ts: number;
  data: {
    created_at: string;
    state: string;
    pay_asset_id: string;
    fill_asset_id: string;
    pay_amount: string;
    fill_amount: string;
    min_amount: string;
    routes: string;
    route_assets: string[];
    transactions: [];
    funds: string;
    amount: string;
  }
}
