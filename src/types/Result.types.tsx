import {Mnemonic, UserSecretKey} from "@multiversx/sdk-wallet/out";
import {UserAddress} from "@multiversx/sdk-wallet/out/userAddress";

export type Result = {
    mnemonic: Mnemonic,
    index: number,
    secretKey: UserSecretKey,
    address: UserAddress,
    shard: number,
}
