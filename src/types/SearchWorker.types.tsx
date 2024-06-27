export type SearchWorkerEvent = {
    event: 'success' | 'count' | 'error',
    id: number,
    count: number,
    message: string,
    address: string,
    mnemonic: string,
    shard: number,
    index: number,
}
