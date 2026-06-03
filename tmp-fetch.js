const { Connection, PublicKey } = require('@solana/web3.js');
const { BorshAccountsCoder } = require('@coral-xyz/anchor');
const bs58mod = require('bs58');
const bs58 = bs58mod.default ?? bs58mod;
const idl = require('./app/klend.json');
const KLEND_KEY = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const coder = new BorshAccountsCoder(idl);
const acc_discriminator = BorshAccountsCoder.accountDiscriminator('Reserve');

(async () => {
  try {
    const fetched = await connection.getProgramAccounts(KLEND_KEY, {
      filters: [{ memcmp: { offset: 0, bytes: bs58.encode(acc_discriminator) } }],
      limit: 20,
    });
    console.log('program', KLEND_KEY.toBase58(), 'count', fetched.length);
    for (let i = 0; i < fetched.length; i += 1) {
      const { pubkey, account } = fetched[i];
      let decoded;
      try {
        decoded = coder.decode('Reserve', account.data);
      } catch (e) {
        decoded = { error: e.message };
      }
      const market = decoded && decoded.lendingMarket && typeof decoded.lendingMarket.toBase58 === 'function'
        ? decoded.lendingMarket.toBase58()
        : decoded.error || 'no decode';
      console.log(i, pubkey.toBase58(), account.data.length, market);
    }
  } catch (err) {
    console.error('err', err);
  }
})();
