export type Operation = 'ADD' | 'REMOVE' | 'BLOCK' | 'UNBLOCK';

export interface RelationshipRequest {
  user_id: string;
  action: Operation;
  phone?: string; // for ADD only
  full_name?: string; // for ADD only
}
