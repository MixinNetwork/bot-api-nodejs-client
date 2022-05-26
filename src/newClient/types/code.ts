import { ConversationResponse } from './conversation';
import { MultisigRequestResponse } from './multisig';
import { NFTRequestResponse } from './collectible';
import { PaymentRequestResponse } from './transfer';
import { UserResponse } from './user';

export type CodeResponse = ConversationResponse | MultisigRequestResponse | NFTRequestResponse | PaymentRequestResponse | UserResponse;
