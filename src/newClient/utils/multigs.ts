import JsSHA from 'jssha';

class Multigs {
  static hashMembers(ids: string[]): string {
    const key = ids.sort().join('');
    const sha = new JsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });
    sha.update(key);
    return sha.getHash('HEX');
  }
}

export default Multigs;
