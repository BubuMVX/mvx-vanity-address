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

    do {
        const mnemonic = Mnemonic.generate()

        for (let index = 0; index < 1000; index++) {
            count++
            postMessage({
                'event': 'count',
                'id': id,
                'count': count,
            })

            const key = mnemonic.deriveKey(index)
            const address = key.generatePublicKey().toAddress().bech32()
            const shortAddress = address.slice(4)

            if (withShard && searchShard != addressComputer.getShardOfAddress(new Address(address))) {
                continue
            }

            if (withPrefix && !shortAddress.startsWith(searchPrefix)) {
                continue
            }

            if (withContains && shortAddress.indexOf(searchContains) == -1) {
                continue
            }

            if (withSuffix && !shortAddress.endsWith(searchSuffix)) {
                continue
            }

            const message = {
                'event': 'success',
                'id': id,
                'address': address,
                'mnemonic': mnemonic.toString(),
                'shard': addressComputer.getShardOfAddress(new Address(address)),
                'index': index,
            }
            console.log(`Worker #${id}`, message)
            postMessage(message)
            searching = false
            break
        }
    } while (searching)

    self.close()
}
