import { MultisigTransaction } from '../types';
import { Encoder, magic } from '../../mvm';

export const TxVersion = 0x02;

export const encodeScript = (threshold: number) => {
  let s = threshold.toString(16);
  if (s.length === 1) s = `0${ s }`;
  if (s.length > 2) throw new Error(`INVALID THRESHOLD ${ threshold }`);

  return `fffe${ s }`;
}

export const encodeTx = (tx: MultisigTransaction) => {
  const enc = new Encoder(Buffer.from([]));

  enc.write(magic);
  enc.write(Buffer.from([0x00, tx.version]));
  enc.write(Buffer.from(tx.asset, 'hex'));

  enc.writeInt(tx.inputs.length);
  tx.inputs.forEach((input) => {
    enc.encodeInput(input)
  })

  enc.writeInt(tx.outputs.length);
  tx.outputs.forEach((output) => {
    enc.encodeOutput(output)
  })

  const extra = Buffer.from(tx.extra, 'hex');
  enc.writeInt(extra.byteLength);
  enc.write(extra);

  enc.writeInt(0)
  enc.write(Buffer.from([]))

  return enc.buf.toString('hex');
}


export const buildMultiSigsTransaction = (input: MultisigTransaction) => {
  if (input.version !== TxVersion) throw new Error('Invalid Version!')

  const tx = {
    ...input,
    outputs: input.outputs.filter((output) => !!output.mask),
    extra: Buffer.from(input.extra).toString('hex')
  };
  return encodeTx(tx);
};
