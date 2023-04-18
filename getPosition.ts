import { Provider, BN, AnchorProvider } from "@project-serum/anchor";
import {
  WhirlpoolContext, AccountFetcher, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil, PriceMath
} from "@orca-so/whirlpools-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { DecimalUtil, TokenUtil } from "@orca-so/common-sdk";
import { PublicKey } from "@solana/web3.js";

let publicKey = new PublicKey("ArYCxfGhJ69QEgkenM9ek3fEEAmWkhbdAEfa5nDrj1ta")
async function main() {
  const provider = AnchorProvider.env();
  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
  const fetcher = new AccountFetcher(ctx.connection);

  const token_accounts = (await ctx.connection.getTokenAccountsByOwner(publicKey, {programId: TOKEN_PROGRAM_ID})).value;

  const whirlpool_position_candidate_pubkeys = token_accounts.map((ta) => {
    const parsed = TokenUtil.deserializeTokenAccount(ta.account.data);
    const pda = PDAUtil.getPosition(ctx.program.programId, parsed.mint);
    return (parsed?.amount as BN).eq(new BN(1)) ? pda.publicKey : undefined;
  }).filter(pubkey => pubkey !== undefined);

  const whirlpool_position_candidate_datas = await fetcher.listPositions(whirlpool_position_candidate_pubkeys, true);

  const whirlpool_positions = whirlpool_position_candidate_pubkeys.filter((pubkey, i) => 
    whirlpool_position_candidate_datas[i] !== null
  );
  whirlpool_positions.map(async(position_pubkey) => {
    let position = await fetcher.getPosition(position_pubkey,true)
    console.log("position pubkey", position_pubkey.toBase58())
  });
}

main();