import crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { AxiosInstance } from 'axios'
import { request } from '../services/request'
import { UserClient } from './user'
import { AddressClient } from './address'


import {
  AddressClientRequest, AddressCreateParams, Address,
  AppClientRequest, UpdateAppRequest, App, FavoriteApp,
  Attachment, AttachmentClientRequest,
  ConversationClientRequest, ConversationCreateParmas, Conversation, ConversationUpdateParams, Participant, ConversationAction,
  MessageClientRequest, AcknowledgementRequest, MessageRequest,
  MultisigClientRequest, MultisigRequest, MultisigUTXO,
  PINClientRequest, Turn,
  SnapshotClientRequest, Snapshot,
  TransferClientRequest, TransferInput, Payment, GhostInput, GhostKeys, WithdrawInput, RawTransaction,
  UserClientRequest, User, UserRelationship, Keystore
} from '../types'
import { AppClient } from './app'
import { AssetClient } from './asset'
import { AttachmentClient } from './attachment'
import { ConversationClient } from './conversation'
import { MessageClient } from './message'
import { MultisigsClient } from './multisigs'
import { PINClient } from './pin'
import { SnapshotClient } from './snapshot'
import { TransferClient } from './transfer'

export class Client implements
  AddressClientRequest,
  AppClientRequest,
  AttachmentClientRequest,
  ConversationClientRequest,
  MessageClientRequest,
  MultisigClientRequest,
  PINClientRequest,
  SnapshotClientRequest,
  TransferClientRequest,
  UserClientRequest {
  request: AxiosInstance
  keystore: Keystore

  constructor(keystore?: Keystore, token?: string) {
    if (!keystore && !token) throw new Error('keystore or token required')
    this.keystore = keystore!
    this.request = request(keystore, token)
  }

  // Address...
  createAddress!: (params: AddressCreateParams, pin?: string) => Promise<Address>
  readAddress!: (address_id: string) => Promise<Address>
  readAddresses!: (asset_id: string) => Promise<Address[]>
  deleteAddress!: (address_id: string, pin?: string) => Promise<void>

  // App...
  updateApp!: (appID: string, params: UpdateAppRequest) => Promise<App>
  readFavoriteApps!: (userID: string) => Promise<FavoriteApp[]>
  favoriteApp!: (appID: string) => Promise<FavoriteApp>
  unfavoriteApp!: (appID: string) => Promise<void>

  //Attachment...

  createAttachment!: () => Promise<Attachment>
  showAttachment!: (attachment_id: string) => Promise<Attachment>
  uploadFile!: (file: File) => Promise<Attachment>

  //Conversation...
  createConversation!: (params: ConversationCreateParmas) => Promise<Conversation>
  updateConversation!: (conversationID: string, params: ConversationUpdateParams) => Promise<Conversation>
  createContactConversation!: (userID: string) => Promise<Conversation>
  createGroupConversation!: (conversationID: string, name: string, participant: Participant[]) => Promise<Conversation>
  readConversation!: (conversationID: string) => Promise<Conversation>
  managerConversation!: (conversationID: string, action: ConversationAction, participant: Participant[]) => Promise<Conversation>
  addParticipants!: (conversationID: string, userIDs: string[]) => Promise<Conversation>
  removeParticipants!: (conversationID: string, userIDs: string[]) => Promise<Conversation>
  adminParticipants!: (conversationID: string, userIDs: string[]) => Promise<Conversation>
  rotateConversation!: (conversationID: string) => Promise<Conversation>

  // Message...

  sendAcknowledgements!: (messages: AcknowledgementRequest[]) => Promise<void>
  sendAcknowledgement!: (message: AcknowledgementRequest) => Promise<void>
  sendMessage!: (message: MessageRequest) => Promise<{}>
  sendMessages!: (messages: MessageRequest[]) => Promise<{}>

  // Multisigs...

  readMultisigs!: (offset: string, limit: number) => Promise<MultisigUTXO[]>
  readMultisigOutputs!: (members: string[], threshold: number, offset: string, limit: number) => Promise<MultisigUTXO[]>
  createMultisig!: (action: string, raw: string) => Promise<MultisigRequest>
  signMultisig!: (request_id: string, pin: string) => Promise<MultisigRequest>
  cancelMultisig!: (request_id: string) => Promise<void>
  unlockMultisig!: (request_id: string, pin: string) => Promise<void>

  // Pin...

  verifyPin!: (pin: string) => Promise<void>
  modifyPin!: (pin: string, newPin: string) => Promise<void>
  readTurnServers!: () => Promise<Turn[]>

  // Snapshot...

  readSnapshots!: (asset_id?: string, offset?: string, order?: string, limit?: number) => Promise<Snapshot[]>
  readNetworkSnapshots!: (asset_id?: string, offset?: string, order?: string, limit?: number) => Promise<Snapshot[]>
  readSnapshot!: (snapshot_id: string) => Promise<Snapshot>
  readNetworkSnapshot!: (snapshot_id: string) => Promise<Snapshot>

  // Transfer...

  verifyPayment!: (params: TransferInput) => Promise<Payment>
  transfer!: (params: TransferInput, pin?: string) => Promise<Snapshot>
  readTransfer!: (trace_id: string) => Promise<Snapshot>
  transaction!: (params: TransferInput, pin?: string) => Promise<RawTransaction>
  readGhostKeys!: (receivers: string[], index: number) => Promise<GhostKeys>
  batchReadGhostKeys!: (input: GhostInput[]) => Promise<GhostKeys[]>
  withdraw!: (params: WithdrawInput, pin?: string) => Promise<Snapshot>

  // User...
  userMe!: () => Promise<User>
  readUser!: (userIdOrIdentityNumber: string) => Promise<User>
  readUsers!: (userIDs: string[]) => Promise<User[]>
  searchUser!: (identityNumberOrPhone: string) => Promise<User>
  readFriends!: () => Promise<User[]>
  createUser!: (full_name: string, session_secret?: string) => Promise<User>
  modifyProfile!: (full_name?: string, avatar_base64?: string) => Promise<User>
  modifyRelationships!: (relationship: UserRelationship) => Promise<User>
  readBlockUsers!: () => Promise<User[]>

  newUUID(): string {
    return uuid()
  }

  uniqueConversationID(userID: string, recipientID: string): string {
    let [minId, maxId] = [userID, recipientID];
    if (minId > maxId) {
      [minId, maxId] = [recipientID, userID];
    }

    const hash = crypto.createHash('md5');
    hash.update(minId);
    hash.update(maxId);
    const bytes = hash.digest();

    bytes[6] = (bytes[6] & 0x0f) | 0x30;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const digest = Array.from(bytes, byte => `0${(byte & 0xff).toString(16)}`.slice(-2)).join('');
    return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-${digest.slice(12, 16)}-${digest.slice(16, 20)}-${digest.slice(20, 32)}`;
  }
}
[
  AddressClient,
  AppClient,
  AssetClient,
  AttachmentClient,
  ConversationClient,
  MessageClient,
  MultisigsClient,
  PINClient,
  SnapshotClient,
  TransferClient,
  UserClient,
].forEach(client => _extends(Client, client))

function _extends(origin: any, target: any) {
  for (const key in target.prototype) {
    origin.prototype[key] = target.prototype[key]
  };
}