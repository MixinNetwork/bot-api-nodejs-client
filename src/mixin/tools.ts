export function toBuffer(content: any, encoding: any = 'utf8') {
  if (typeof content === 'object') {
    content = JSON.stringify(content);
  }
  return Buffer.from(content, encoding);
}
