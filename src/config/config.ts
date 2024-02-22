
if (!process.env.JSON_RPC_URL || !process.env.WSS_URL) {
    console.info("Please kindly provide your WSS_URL,JSON_RPC_URL in your dotenv")

}
export const Config = {

    PRIVATE_KEY: process.env.PRIVATE_KEY!,

    //provide comments to each of these configs
    WSS_URL: process.env.WSS_URL!,
    JSON_RPC_URL: process.env.JSON_RPC_URL!,

    PANCAKESWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",//uniswap
    PANCAKESWAP_V3_ROUTER: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4", //pancake
    PAIR_FACTORY_BSC: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", //pancake
    RESERVES_CHECK_CONTRACT_ADDRESS: "0x3B33De70422301dc26Baf42592d067677Ee14456", //pancake
    WBNB: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //uniswap
    SUPPORTED_TOKEN: "", //supported token

    METHODS_EXCLUDED: ["0x", "0x0", "0x00"],

    MULTICALL_METHODS:  ["0x5ae401dc", "0xac9650d8"],

    TOKENS_TO_MONITOR: [
        "", //suported token
    ],

    SUPPORTED_BUY_METHODS: [
        "swapExactETHForTokens",
        "swapExactETHForTokensSupportingFeeOnTransferTokens",
        "swapETHForExactTokens",
        "swapExactTokensForTokensSupportingFeeOnTransferTokens"

    ],

    SUPPOTED_SELL_METHODS: [
        "swapExactTokensForETH",
        "swapExactTokensForTokens",
        "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        "swapExactTokensForETHSupportingFeeOnTransferTokens"
    ],


    IS_BOT_ON: true,
    MONGO_URL: process.env.MONGO_URL!,

    AUTHORIZED_USERS: [''],

    BOT_TOKEN: process.env.BOT_TOKEN!,


    //include execution times
    EXECUTION_TIME: [3, 2, 4, 6, 5, 7], // minutes

    //include random buy amounts
    EXECUTION_AMOUNT: [0.001, 0.002, 0.003],

    //include random wallets and private key
    WALLETS: [
        
        {   
            ADDRESS: "0xcB4Ea187Ba09dc695B6c8510516b85396BCDf02E",
            PRIVATE_KEY: process.env.PRIVATE_KEY_1,
        },
        {
            ADDRESS: "0x00f2a2A735219BC09F369F2a33be2536Dc5E161d",
            PRIVATE_KEY: process.env.PRIVATE_KEY_2,
        },
    ],

    //include priceImpact
    PRICEIMPACT: [{ SELLING: 0.3, BUYING: 0.1 }],

    ACTION: [{BUY: "BUY", SELL: "SELL"}],

    PERCENTAGE_TO_SELL: 50

}