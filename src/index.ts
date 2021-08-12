const log = (t: string) => console.log(`log ${t}`)


log('test')

class T {
  t1: number
  t2: number
  constructor() {
    this.t1 = 1
    this.t2 = 2
  }

  t3() {
    return this.t1 + this.t2
  }
}

const t = new T()
t.t3()