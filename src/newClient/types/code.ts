import { ConversationResponse } from './conversation';
import { MultisigRequestResponse } from './multisig';
import { CollectibleGenerateResponse } from './collectible';
import { PaymentRequestResponse } from './transfer';
import { UserResponse } from './user';

export type CodeResponse = ConversationResponse | MultisigRequestResponse | CollectibleGenerateResponse | PaymentRequestResponse | UserResponse;