export const delay = (n = 500) => new Promise<void>(resolve => {
  setTimeout(() => {
    resolve()
  }, n)
})

export function toBuffer(content: any, encoding: any = 'utf8') {
  if (typeof content === 'object') {
      content = JSON.stringify(content)
  }
  return Buffer.from(content, encoding)
}
