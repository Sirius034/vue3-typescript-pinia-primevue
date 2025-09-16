export type Entry = {
  id: string | number,
  tags: {
    text: string
  }[],
  recordType: string,
  login: string,
  password: string | null
}
