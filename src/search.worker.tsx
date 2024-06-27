import {Mnemonic} from "@multiversx/sdk-wallet/out";
import {Address, AddressComputer} from "@multiversx/sdk-core/out";

self.onmessage = async (event: MessageEvent) => {
    if (!event) {
        self.close()
        return
    }

    const id = parseInt(event.data.id ?? -1)
    console.info(`Start worker #${id}`)

    const searchShard = (event.data.searchShard ?? -1)
    const searchPrefix = (event.data.searchPrefix ?? '').toLowerCase()
    const searchSuffix = (event.data.searchSuffix ?? '').toLowerCase()

    let count = 0
    let searching = true
    const addressComputer = new AddressComputer()

    while (searching) {
        const mnemonic = Mnemonic.generate()

        for (let index = 0; index < 1000; index++) {
            count++

            //if (count % 10 == 0) {
                postMessage({
                    'event': 'count',
                    'id': id,
                    'count': count,
                })
            //}

            const key = mnemonic.deriveKey(index)
            const address = new Address(key.generatePublicKey().toAddress().bech32())
            const shortAddress = address.bech32().slice(4)
            const shard = addressComputer.getShardOfAddress(address)

            if (shortAddress.startsWith(searchPrefix) && shortAddress.endsWith(searchSuffix) && (searchShard == -1 || searchShard == shard)) {
                const message = {
                    'event': 'success',
                    'id': id,
                    'count': count,
                    'address': address.bech32(),
                    'mnemonic': mnemonic.toString(),
                    'shard': shard,
                    'index': index,
                }
                console.log(`Worker #${id}`, message)
                postMessage(message)
                searching = false
            }
        }
    }

    self.close()
}
