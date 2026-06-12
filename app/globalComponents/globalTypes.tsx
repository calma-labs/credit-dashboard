//standarized metric's type 
export type StandarizedMetric = {
  symbol:       string,
  mintAddress:  string,
  tvl:          number,
  utilization:  number,
  supplyAPY:    number,
  borrowRate:   number,   
}

//compared metrics
export type ComparedMetric = {
  mintAddress:  string,
  tvl:          number | string,
  utilization:  number | string,
  supplyAPY:    number | string,
  borrowRate:   number | string,   
}


//metric's type
export type MatchedTokens = {
  
  //symbol of matching tokens
  symbol: string;

  //left side
  leftSide: ComparedMetric,

  //right side
  rightSide: ComparedMetric,

  //save Side
  saveSide: ComparedMetric,

}