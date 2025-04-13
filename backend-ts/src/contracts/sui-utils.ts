import { client } from "./sui-constants";

//return the payment that was created
export const getSplitCoin = async (wallet: string, amount:number) => {
    const coins = await client.getCoins({
        owner: wallet,
    });
    let ownedCoins = coins.data
    if(Number(ownedCoins[0].balance) != amount){
        for(const coin of ownedCoins){
            if(Number(coin.balance) == amount){
                return coin
            }
        }
    }
    return ownedCoins[0]
}