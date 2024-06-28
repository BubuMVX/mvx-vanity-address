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
    const searchContains = (event.data.searchContains ?? '').toLowerCase()
    const searchSuffix = (event.data.searchSuffix ?? '').toLowerCase()

    const withShard = searchShard > -1
    const withPrefix = searchPrefix.length > 0
    const withContains = searchContains.length > 0
    const withSuffix = searchSuffix.length > 0

    let count = 0
    let searching = true
    const addressComputer = new AddressComputer()

    while (searching) {
        const mnemonic = Mnemonic.generate()

        for (let index = 0; index < 1000; index++) {
            count++
            postMessage({
                'event': 'count',
                'id': id,
                'count': count,
            })

            const key = mnemonic.deriveKey(index)
            const address = new Address(key.generatePublicKey().toAddress().bech32())
            const shortAddress = address.bech32().slice(4)
            let match = true

            if (withShard) {
                const computedShard = addressComputer.getShardOfAddress(address)
                match = (match && searchShard == computedShard)
            }

            if(withPrefix) {
                match = (match && shortAddress.startsWith(searchPrefix))
            }

            if(withContains) {
                match = (match && shortAddress.indexOf(searchContains) > -1)
            }

            if(withSuffix) {
                match = (match && shortAddress.endsWith(searchSuffix))
            }

            if (match) {
                const message = {
                    'event': 'success',
                    'id': id,
                    'address': address.bech32(),
                    'mnemonic': mnemonic.toString(),
                    'shard': addressComputer.getShardOfAddress(address),
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
