import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';

(async () => {
    // Connect to cluster and generate two new Keypairs
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = Keypair.generate();
    const toWallet = Keypair.generate();

    // Get the public and private keys of the toWallet for use as minter in Phantom wallet
    const minterPublicKey = toWallet.publicKey.toBase58();
    // Convert the private key to a hexadecimal string
    const privateKeyHex = Buffer.from(toWallet.secretKey).toString('hex');
    // output them to the console
    console.log('Public Key:', minterPublicKey);
    console.log('Private Key (Hex):', privateKeyHex);

    // Step 2: Airdrop SOL into your from wallet
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });


    // Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    )

    // Mint new tokens to the from account
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        3000000000,
        []
    );
    console.log('mint tx:', signature);

    // Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);
    
    // Transfer the new tokens to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        3000000000,
        []
    );
    console.log('transfer tx:', signature);

})();

// solana config set --url https://api.devnet.solana.com