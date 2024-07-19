export interface Path {
    tokenIn: string,
    tokenOut: string
}

export interface DecodedData {
    methodName: string,
    path: Path,
    txnType?: string,
    amountIn?: number,
    amountOutMin?: number,
    amountOut?: number,
    amountInMax?: number,
  }