import { useWalletModalStore } from '@/app/store/walletModalStore'
import { useWalletStore } from '@/app/store/walletStore'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  type RpcResponseAndContext,
  type SignatureResult,
} from '@solana/web3.js'
import { USDT_MINT } from '@/constants/mints'
import { getAssociatedTokenAddress, getAccount, createTransferInstruction } from '@solana/spl-token'
import { api } from '@/app/api'


class Wallets {
  static isConnected: boolean = false
  // static connection: Connection = new Connection(clusterApiUrl('mainnet-beta'))
  static connection: Connection = new Connection('https://multi-skilled-sunset.solana-mainnet.quiknode.pro/b5bc302f27310a2f77845915b4b3bf3ff90d42a0/')

  static async init() {
    const balance = await this.getBalance()
    useWalletStore.setState({ balance: { sol: balance.sol, usdt: balance.usdt } })
    useWalletModalStore.setState({ isOpen: false })
    useWalletStore.setState({ isConnected: true })
  }

  static async connect() {
    try {
      if ((window as any).appKit) {
        (window as any).appKit.open({ view: 'Connect' })
      } else {
        console.error('AppKit not initialized')
        throw new Error('AppKit not initialized')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  static async getBalance(address?: string): Promise<{ sol: number; usdt: number }> {
    if (!address) return { sol: 0, usdt: 0 }
    
    const solBalance = await this.getSolBalance(address)
    const usdtBalance = await this.getUsdtBalance(address)

    useWalletStore.setState({ balance: { sol: solBalance, usdt: usdtBalance } })

    return { sol: solBalance, usdt: usdtBalance }
  }

  private static async getSolBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address)
      const balanceLamports = await this.connection.getBalance(publicKey)
      const balance = balanceLamports / LAMPORTS_PER_SOL

      return this.formatBalance(balance)
    } catch {
      return 0
    }
  }

  private static async getUsdtBalance(address: string): Promise<number> {
    try {
      const owner = new PublicKey(address)
      const ata = await getAssociatedTokenAddress(USDT_MINT, owner)

      const tokenAccount = await getAccount(this.connection, ata)
      const balance = Number(tokenAccount.amount) / 1e6

      return this.formatBalance(balance)
    } catch {
      return 0
    }
  }

  private static formatBalance(balance: number): number {
    return Number(balance.toFixed(2))
  }

  static async sendForPurchase(
    toPublicKey: string,
    amount: number,
    currency: 'SOL' | 'USDT',
    walletProvider: any,
    fromAddress: string,
    connection?: any
  ): Promise<string> {
    try {
      console.log(`Sending ${amount} ${currency} for purchase to ${toPublicKey}`)
      
      const currencyLower = currency.toLowerCase() as 'sol' | 'usdt'
      const activeConnection = connection || this.connection
      
      if (currencyLower === 'sol') {
        const signature = await this.sendSolForPurchase(toPublicKey, amount, walletProvider, fromAddress, activeConnection)
        console.log(`Purchase payment sent successfully: ${signature}`)
        return signature
      } else {
        const signature = await this.sendSplTokenForPurchase(toPublicKey, amount, walletProvider, fromAddress, activeConnection)
        console.log(`Purchase payment sent successfully: ${signature}`)
        return signature
      }
    } catch (error) {
      console.error('Failed to send payment for purchase:', error)
      throw error
    }
  }

  static async disconnect() {
    if ((window as any).appKit) {
      try {
        (window as any).appKit.close()
        console.log('Wallet disconnected')
      } catch (error) {
        console.error('Error disconnecting wallet:', error)
      }
    }

    this.isConnected = false
    useWalletStore.setState({ balance: { sol: 0, usdt: 0 } })
    useWalletStore.setState({ isConnected: false })
  }

  // Airdrop is not needed anymore. Just for tests
  // static async airdrop(lamports: number, address: string): Promise<string> {
  //   try {
  //     const publicKey = new PublicKey(address)
  //     const signature = await this.connection.requestAirdrop(publicKey, lamports)

  //     await this.confirmTransaction(signature)
  //     await this.getBalance(address)

  //     console.log(`Airdropped ${lamports} lamports to ${publicKey.toBase58()}`)
  //     return signature
  //   } catch (e) {
  //     console.error('Airdrop failed:', e)
  //     throw e
  //   }
  // }

  private static async sendSolForPurchase(
    toPublicKey: string,
    amount: number,
    walletProvider: any,
    fromAddress: string,
    connection: any
  ): Promise<string> {
    let signature: string = ''
    try {
      const fromPublicKey = new PublicKey(fromAddress)
      const toPubKey = new PublicKey(toPublicKey)
      const feeLamports = 5000
      const transferAmount = (amount * LAMPORTS_PER_SOL) - feeLamports
      
      if (transferAmount <= 0) {
        throw new Error('Amount too small to cover transaction fee')
      }

      console.log(`Sending ${Number(amount)} SOL (${transferAmount} lamports) to ${toPublicKey} from ${fromPublicKey.toBase58()}`)

      const instruction = SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPubKey,
        lamports: transferAmount,
      })

      const transaction = new Transaction().add(instruction)
      const { blockhash, lastValidBlockHeight } = await this.getBlockhashWithRetry(connection)

      transaction.recentBlockhash = blockhash
      transaction.feePayer = fromPublicKey

      signature = await walletProvider.signAndSendTransaction(transaction)
      console.log('Transaction signature:', signature)

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'finalized')

      console.log('Transaction confirmed')
      await this.getBalance(fromAddress)

      return signature
    } catch (e) {
      console.error('Failed to send SOL for purchase:', e)
      throw e
    }
    finally {
      await this.sendTransactionOnServer(amount, 'SOL', fromAddress, signature)
    }
  }

  private static async sendSplTokenForPurchase(
    toPublicKey: string,
    amount: number,
    walletProvider: any,
    fromAddress: string,
    connection: any
  ): Promise<string> {
    let signature: string = ''
    try {
      const sender = new PublicKey(fromAddress)
      const receiver = new PublicKey(toPublicKey)

      const senderTokenAccount = await getAssociatedTokenAddress(USDT_MINT, sender)
      const receiverTokenAccount = await getAssociatedTokenAddress(USDT_MINT, receiver)

      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        receiverTokenAccount,
        sender,
        amount * 1e6,
        []
      )

      const transaction = new Transaction().add(transferInstruction)
      const { blockhash, lastValidBlockHeight } = await this.getBlockhashWithRetry(connection)
  
      transaction.recentBlockhash = blockhash
      transaction.feePayer = sender

      signature = await walletProvider.signAndSendTransaction(transaction)
      console.log('Transaction signature:', signature)

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'finalized')

      console.log('Transaction confirmed')
      await this.getBalance(fromAddress)

      return signature
    } catch (e) {
      console.error('Failed to send SPL token for purchase:', e)
      throw e
    }
    finally {
      await this.sendTransactionOnServer(amount, 'USDT', fromAddress, signature)
    }
  }

  private static async sendTransactionOnServer(
    amount: number,
    currency: 'SOL' | 'USDT',
    fromAddress: string,
    signature: string
  ) {
    console.log('Sending transaction on server:', { amount, currency, fromAddress, signature })
  
    try {
      const response = await api.post('/user/purchase', {
        signature,
        address: fromAddress,
        type: currency,
        amount: amount
      })

      console.log(response)
    }
    catch (e) {
      console.error('Failed to send transaction on server:', e)
      throw e
    }
  }

  private static async confirmTransaction(
    signature: string
  ): Promise<RpcResponseAndContext<SignatureResult> | null> {
    try {
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed')
      return confirmation
    } catch (e) {
      console.warn(`Transaction confirmation failed, but transaction may still be processed:`, e)
      return null
    }
  }

  private static async getBlockhashWithRetry(
    connection: any,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Getting blockhash (attempt ${attempt}/${maxRetries})`)
        const result = await connection.getLatestBlockhash('finalized')
        console.log('Blockhash obtained successfully')
        return result
      } catch (error) {
        console.warn(`Failed to get blockhash (attempt ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to get blockhash after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`)
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
    
    throw new Error('Unexpected error in getBlockhashWithRetry')
  }
}

export { Wallets }
