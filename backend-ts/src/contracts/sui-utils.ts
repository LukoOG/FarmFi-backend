import { client } from "./sui-constants";

export const getOwnedCoins = async (wallet: string) => {
    const coins = await client.getCoins({
        owner: wallet,
    });
    // console.log(coins.data.find(coin=>coin.balance == 4*sui_conversion));
    return coins.data.pop();
}