import { SHA3 } from 'sha3';

const TIPSequencerRegister = 'SEQUENCER:REGISTER:';

export const TIPBodyForSequencerRegister = (user_id: string, pubKey: string) => tipBody(`${TIPSequencerRegister}${user_id}${pubKey}`);

export const tipBody = (s: string) => {
  const hash = new SHA3(256).update(s).digest('utf8');
  return hash;
};
