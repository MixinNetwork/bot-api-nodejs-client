import { ConversationResponse } from './conversation';
import { MultisigRequestResponse } from './multisig';
import { CollectibleTransactionResponse } from './collectible';
import { PaymentRequestResponse } from './payment';
import { UserResponse } from './user';

export type CodeResponse = ConversationResponse | MultisigRequestResponse | CollectibleTransactionResponse | PaymentRequestResponse | UserResponse;
