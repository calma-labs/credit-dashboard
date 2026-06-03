const { Connection, PublicKey } = require('@solana/web3.js');
const { BorshAccountsCoder } = require('@coral-xyz/anchor');
const bs58mod = require('bs58');
const bs58 = bs58mod.default ?? bs58mod;
const idl = require('./app/klend.json');
const KLEND_KEY = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const coder = new BorshAccountsCoder(idl);

(async () => {
  try {
    const fetched = await connection.getProgramAccounts(KLEND_KEY, { limit: 20 });
    console.log('count', fetched.length);
    for (let i = 0; i < fetched.length; i += 1) {
      const { pubkey, account } = fetched[i];
      console.log(i, pubkey.toBase58(), account.data.length, account.owner.toBase58());
      const slice = account.data.slice(0, 32);
      console.log('first32', Buffer.from(slice).toString('hex'));
      try {
        const decoded = coder.decode('Reserve', account.data);
        console.log('decoded lendingMarket', decoded.lendingMarket.toBase58());
      } catch (err) {
        console.log('decode error', err.message);
      }
    }
  } catch (err) {
    console.error('err', err);
  }
})();
