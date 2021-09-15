import { AggregatedSignature, Input, Output, Transaction } from '../types'

const maxEcodingInt = 0xFFFF
const aggregatedSignaturePrefix = 0xFF01

const magic = Buffer.from([0x77, 0x77])
const empty = Buffer.from([0x00, 0x00])
class Encoder {
  buf: Buffer
  constructor(buf: Buffer) {
    this.buf = buf
  }
  write(buf: Buffer) {
    this.buf = Buffer.concat([this.buf, buf])
  }
  writeInt(i: number) {
    if (i > maxEcodingInt) {
      throw new Error('int overflow')
    }
    let buf = Buffer.alloc(2)
    buf.writeInt16BE(i)
    this.write(buf)
  }

  wirteUint64(i: bigint) {
    let buf = Buffer.alloc(8)
    buf.writeBigUInt64BE(i)
    this.write(buf)
  }

  wirteUint16(i: number) {
    let buf = Buffer.alloc(2)
    buf.writeUInt16BE(i)
    this.write(buf)
  }

  writeInteger(i: number) {
    const b = getIntBytes(i)
    this.writeInt(b.length)
    this.write(Buffer.from(b))
  }

  encodeInput(i: Input) {
    this.write(Buffer.from(i.hash!, 'hex'))
    this.writeInt(i.index!)

    if (!i.genesis) i.genesis = ""
    this.writeInt(i.genesis.length)
    this.write(Buffer.from(i.genesis))
    let d = i.deposit
    if (typeof d === 'undefined') {
      this.write(empty)
    } else {
      this.write(magic)
      this.write(Buffer.from(d.chain, 'hex'))

      if (!d.asset) d.asset = ""
      this.writeInt(d.asset.length)
      this.write(Buffer.from(d.asset))

      if (!d.transaction) d.transaction = ""
      this.writeInt(d.transaction.length)
      this.write(Buffer.from(d.transaction))

      this.wirteUint64(d.index)
      this.writeInteger(d.amount)
    }
    let m = i.mint
    if (typeof m === 'undefined') {
      this.write(empty)
    } else {
      this.write(magic)
      if (!m.group) m.group = ""
      this.writeInt(m.group.length)
      this.write(Buffer.from(m.group))

      this.wirteUint64(m.batch)
      this.writeInteger(m.amount)
    }
  }

  encodeOutput(o: Output) {
    if (!o.type) o.type = 0
    this.write(Buffer.from([0x00, o.type]))
    this.writeInteger(o.amount!)
    this.writeInt(o.keys!.length)

    o.keys!.forEach(k => this.write(Buffer.from(k, 'hex')))

    this.write(Buffer.from(o.mask!, 'hex'))
    if (!o.script) o.script = []
    this.writeInt(o.script.length)
    this.write(Buffer.from(o.script))

    const w = o.withdrawal
    if (typeof w === 'undefined') {
      this.write(empty)
    } else {
      this.write(magic)
      this.write(Buffer.from(w.chain, 'hex'))

      if (!w.asset) w.asset = ""
      this.writeInt(w.asset.length)
      this.write(Buffer.from(w.asset))

      if (!w.address) w.address = ""
      this.writeInt(w.address.length)
      this.write(Buffer.from(w.address))

      if (!w.tag) w.tag = ""
      this.writeInt(w.tag.length)
      this.write(Buffer.from(w.tag))
    }
  }
  // TODO... not check...
  encodeAggregatedSignature(js: AggregatedSignature) {
    this.writeInt(maxEcodingInt)
    this.writeInt(aggregatedSignaturePrefix)
    this.write(Buffer.from(js.signature, 'hex'))

    if (js.signers.length === 0) {
      this.write(Buffer.from([0x00]))
      this.writeInt(0)
      return
    }

    js.signers.forEach((m, i) => {
      if (i > 0 && m <= js.signers[i - 1]) {
        throw new Error('signers not sorted')
      }
      if (m > maxEcodingInt) {
        throw new Error('signer overflow')
      }
    })

    const max = js.signers[js.signers.length - 1]
    if (max / 8 + 1 > js.signature.length * 2) {
      this.write(Buffer.from([0x01]))
      this.writeInt(js.signature.length)
      js.signers.forEach(m => this.writeInt(m))
      return
    }

    const masks = Buffer.alloc((max / 8 + 1) | 0)
    js.signers.forEach(m => masks[m / 8] ^= 1 << (m % 8))
    this.write(Buffer.from([0x00]))
    this.writeInt(masks.length)
    this.write(masks)
  }

  encodeSignature(sm: { [key: number]: string }) {
    const ss = Object.keys(sm)
      .map((j, i) => ({ index: j, sig: sm[i] }))
      .sort((a, b) => Number(a.index) - Number(b.index))

    this.writeInt(ss.length)
    ss.forEach(s => {
      this.wirteUint16(Number(s.index))
      this.write(Buffer.from(s.sig, 'hex'))
    })
  }
}



function getIntBytes(x: number) {
  var bytes = []
  do {
    if (x === 0) break
    bytes.unshift(x & (255))
    x = x / (2 ** 8) | 0
  } while (1)
  return bytes
}

export function dumpTransaction(signed: Transaction) {
  let enc = new Encoder(magic)
  enc.write(Buffer.from([0x00, signed.version!]))
  enc.write(Buffer.from(signed.asset, 'hex'))

  const il = signed.inputs!.length
  enc.writeInt(il)
  signed.inputs!.forEach(i => enc.encodeInput(i))

  const ol = signed.outputs!.length
  enc.writeInt(ol)
  signed.outputs!.forEach(o => enc.encodeOutput(o))

  if (!signed.extra) signed.extra = ""
  const el = signed.extra.length
  enc.writeInt(el)
  enc.write(Buffer.from(signed.extra))

  if (signed.aggregated_signature) {
    enc.encodeAggregatedSignature(signed.aggregated_signature)
  } else {

    const sl = signed.signatures ? Object.keys(signed.signatures).length : 0
    if (sl == maxEcodingInt) throw new Error('signatures overflow')
    enc.writeInt(sl)
    if (sl > 0) {
      Object.values(signed.signatures!).forEach(s => enc.write(Buffer.from(s, 'hex')))
    }
  }
  return enc.buf
}
