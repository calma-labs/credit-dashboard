## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## To launch properly the code you need to:

change 
``` env.local
NEXT_PUBLIC_HELIUS_API_KEY = [Your Unique API Key]
```

## Simple documentation:

```TypeScript

const KAMINO_DATA = await fetchReserves();
const JUPLEND_DATA = await useJupLendData();
const GET_KAMINO_SLOT = await getSlotForAPY();

```
allows you to acces fetched reserves form Kamino and JupLend, and slot which allows you to calculate the Utilization and borrow Rate with Kamino's Market method

```TypeScript
calculateUtilizationRatio() * 100
calculateBorrowAPR(KAMINO_SLOT, Math.floor(KAMINO_TOKEN.calculateUtilizationRatio() * 10000)) * 100
```


```TypeScript
type MatchedTokens = {
  
  symbol: string;

  kaminoLeftSide: {
    mintAddress: string,
    tvl: number,
    supplyAPY: number;
    utilization: number,
    borrowRate: number,
  }

  juplendRightSide: {
    mintAddress: string,
    tvl: number,
    supplyAPY: number,
    utilization: number,
    borrowRate: number,
  }

}
```
allows you to access those tokens, which has the same mint address and Token's symbol

```TypeScript
let comparisonResults: MatchedTokens[] = [];
```

all matched Tokens are stored in MatchedTokens arrays
