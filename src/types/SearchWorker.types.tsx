export type SearchWorkerEvent = {
    event: 'success' | 'count' | 'error',
    id: number,
    count: number,
    message: string,
    hrp: string,
    address: string,
    mnemonic: string,
    shard: number,
    index: number,
}
