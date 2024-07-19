import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

class WalletPrivateKeyGen {

    constructor() {
    }

    public walletPrivateKeyGenerator = async () => {
        try {
            const number = 10;

            //logic to transfer BNB to newly create wallets

            for (let i = 0; i <= number; i++) { 
                const privateKey = generatePrivateKey()
                const account = privateKeyToAccount(privateKey)
                console.log("Private key", privateKey)
                console.log("Account address", account.address) 
           
            }
            
        } catch (error) {
            console.log("Error while generating wallet & private-key", error)
        }
    }

}


export const WalletPrivateKeyGenWrapper = new WalletPrivateKeyGen;

