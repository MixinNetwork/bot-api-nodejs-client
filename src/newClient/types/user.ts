export type Operation = 'ADD' | 'REMOVE' | 'BLOCK' | 'UNBLOCK';

export interface UserRelationship {
  user_id: string;
  action: Operation;
  phone?: string;
  full_name?: string;
}
