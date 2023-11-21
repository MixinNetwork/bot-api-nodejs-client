import forge from 'node-forge';

const TIPSequencerRegister = 'SEQUENCER:REGISTER:';

export const TIPBodyForSequencerRegister = (user_id: string, pubKey: string) => tipBody(`${TIPSequencerRegister}${user_id}${pubKey}`);

export const tipBody = (s: string) => {
  const md = forge.md.sha256.create();
  md.update(s, 'utf8');
  return md.digest().toHex();
};
