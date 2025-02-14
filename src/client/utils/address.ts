import bs58 from 'bs58';
import { stringify, parse } from 'uuid';
import type { MixAddress } from '../types';
import { newHash } from './uniq';
import { newKeyFromSeed, publicFromPrivate } from './ed25519';

export const MainAddressPrefix = 'XIN';
export const MixAddressPrefix = 'MIX';
export const MixAddressVersion = 2;

export const getPublicFromMainnetAddress = (address: string) => {
  try {
    if (!address.startsWith(MainAddressPrefix)) return undefined;

    const data = bs58.decode(address.slice(3));
    if (data.length !== 68) return undefined;

    const payload = data.subarray(0, data.length - 4);
    const msg = Buffer.concat([Buffer.from(MainAddressPrefix), Buffer.from(payload)]);
    const checksum = newHash(msg);
    if (!checksum.subarray(0, 4).equals(data.subarray(64))) return undefined;
    return Buffer.from(payload);
  } catch {
    return undefined;
  }
};

export const getMainnetAddressFromPublic = (pubKey: Buffer) => {
  const msg = Buffer.concat([Buffer.from(MainAddressPrefix), pubKey]);
  const checksum = newHash(msg);
  const data = Buffer.concat([pubKey, checksum.subarray(0, 4)]);
  return `${MainAddressPrefix}${bs58.encode(data)}`;
};

export const getMainnetAddressFromSeed = (seed: Buffer) => {
  const hash1 = newHash(seed);
  const hash2 = newHash(hash1);
  const src = Buffer.concat([hash1, hash2]);
  const spend = newKeyFromSeed(seed);
  const view = newKeyFromSeed(src);
  const pub = Buffer.concat([publicFromPrivate(spend), publicFromPrivate(view)]);
  return getMainnetAddressFromPublic(pub);
};

export const parseMixAddress = (address: string): MixAddress | undefined => {
  try {
    if (!address.startsWith(MixAddressPrefix)) return undefined;

    const data = bs58.decode(address.slice(3));
    if (data.length < 3 + 16 + 4) {
      return undefined;
    }

    const payload = data.subarray(0, data.length - 4);
    const msg = Buffer.concat([Buffer.from(MixAddressPrefix), Buffer.from(payload)]);
    const checksum = newHash(msg);
    if (!checksum.subarray(0, 4).equals(Buffer.from(data.subarray(data.length - 4)))) return undefined;

    const version = data.at(0);
    const threshold = data.at(1);
    const total = data.at(2);
    if (version !== 2) return undefined;
    if (!threshold || !total || threshold === 0 || threshold > total || total > 64) return undefined;

    const memberData = payload.subarray(3);
    const members: string[] = [];
    if (memberData.length === total * 16) {
      for (let i = 0; i < total; i++) {
        const id = stringify(memberData, 16 * i);
        members.push(id);
      }
      return {
        version,
        uuidMembers: members,
        xinMembers: [],
        threshold,
      };
    }
    if (memberData.length === total * 64) {
      for (let i = 0; i < total; i++) {
        const pub = memberData.subarray(64 * i, 64 * (i + 1));
        const addr = getMainnetAddressFromPublic(Buffer.from(pub));
        members.push(addr);
      }
      return {
        version,
        uuidMembers: [],
        xinMembers: members,
        threshold,
      };
    }

    return undefined;
  } catch {
    return undefined;
  }
};

export const getMixAddressBuffer = (ma: MixAddress) => {
  const members = ma.uuidMembers.length ? ma.uuidMembers : ma.xinMembers;
  if (members.length > 255) {
    throw new Error(`invalid members length: ${members.length}`);
  }
  if (ma.threshold === 0 || ma.threshold > members.length) {
    throw new Error(`invalid threshold: ${ma.threshold}`);
  }

  const prefix = Buffer.concat([Buffer.from([MixAddressVersion]), Buffer.from([ma.threshold]), Buffer.from([members.length])]);

  const memberData: Buffer[] = [];
  if (ma.uuidMembers.length)
    members.forEach(addr => {
      const id = parse(addr);
      if (!id) throw new Error(`invalid uuid address: ${addr}`);
      memberData.push(Buffer.from(Uint8Array.from(id)));
    });
  else if (ma.xinMembers)
    members.forEach(addr => {
      const pub = getPublicFromMainnetAddress(addr);
      if (!pub) throw new Error(`invalid mainnet address: ${addr}`);
      memberData.push(pub);
    });

  return Buffer.concat([prefix, ...memberData]);
};

export const getMixAddressStringFromBuffer = (data: Buffer) => {
  const msg = Buffer.concat([Buffer.from(MixAddressPrefix), data]);
  const checksum = newHash(msg);
  const buffer = Buffer.concat([data, checksum.subarray(0, 4)]);
  return `${MixAddressPrefix}${bs58.encode(buffer)}`;
};

export const buildMixAddress = (ma: MixAddress): string => {
  const data = getMixAddressBuffer(ma);
  return getMixAddressStringFromBuffer(data);
};
