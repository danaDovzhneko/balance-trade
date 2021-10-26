export interface Wallet {
   tradeHistory: {
        [key: string]: {
            tradeId: number,
            amountChange: number,
            isEndValue: boolean
        }[]
   },
   balance: number
}