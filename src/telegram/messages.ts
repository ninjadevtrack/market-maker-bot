 export class Messages {
    constructor() {
    }

    startMessage = () => {
        let message = "⛽ WELCOME TO DEX TEAM MARKET MAKER ⛽"
        return message
    }
    
    SuccessfulSellMessage = (sellTx: any, token: string) => {
        let message = "🔥   SELL NOTIFICATION   🔥";
        message += `\n\nToken`;
        message += `\n\nhttps://etherscan.io/tx/${token}`;
        message += `\n\n Tx Hash`;
        message += `\n\nhttps://etherscan.io/tx/${sellTx.data}`;
        return message;
    };
    
    SuccessfulBuyMessage = (token: string, buyTx: any) => {

        let message = "🔥 Successful BUY  Transaction 🔥"
        message += "\n\nToken"
        message += `\n\nhttps://etherscan.io/tx/${token}`;
        message += "\n\n Transaction"
        message += `\n\nhttps://etherscan.io/tx/${buyTx.data}`;
        return message
    
    }
     
    ApproveTransactionMessage = (token: string, approveTx: any) => {
        let message = "Approval Successful"
        message += "\n\nToken"
        message += `\n\nhttps://etherscan.io/tx/${token}`;
        message += "\n\nTransaction"
        message += `\n\nhttps://etherscan.io/tx/${approveTx.data}`;
    
        return message
    }

    unSuccessfulApproval = (token: string) => {
        let message = "Failed to Approve token"
        message += `\n\n You may need to approve it manually ${token}`
        return message
    }

    unSuccessfulTransactionMessage=(token: string, txHash: any) => {

        let message = "Failed Transaction"
        message += "\n\nToken"
        message += `\n\nhttps://etherscan.io/tx/${token}`;
        message += "\n\n Transaction"
        message += `\n\nhttps://etherscan.io/tx/${txHash.data}`;

        return message
    }


}

export const MessagesWrapper = new Messages()
