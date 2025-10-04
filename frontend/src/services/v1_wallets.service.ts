import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
  BitgetWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinhubWalletAdapter,
  HuobiWalletAdapter,
  KeystoneWalletAdapter,
  KrystalWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  OntoWalletAdapter,
  SaifuWalletAdapter,
  SkyWalletAdapter,
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  XDEFIWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import {
  type WalletName,
  WalletReadyState,
  type WalletAdapter,
  WalletAdapterNetwork,
} from '@solana/wallet-adapter-base'
import { useWalletModalStore } from '@/app/store/walletModalStore'
import { useWalletStore } from '@/app/store/walletStore'
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  type RpcResponseAndContext,
  type SignatureResult,
} from '@solana/web3.js'
import { USDT_MINT } from '@/constants/mints'
import { getAssociatedTokenAddress, getAccount, createTransferInstruction } from '@solana/spl-token'

interface AdapterWithSendTransaction extends WalletAdapter {
  sendTransaction?: (
    transaction: Transaction,
    connection: Connection,
    options?: {
      preflightCommitment?: string,
      skipPreflight?: boolean,
      maxRetries?: number
    }
  ) => Promise<string>
}

class Wallets {
  static readonly adapters = {
    // Популярные Solana кошельки
    phantom: new PhantomWalletAdapter(),
    solflare: new SolflareWalletAdapter(),
    
    // Мультичейн кошельки
    trust: new TrustWalletAdapter(),
    coinbase: new CoinbaseWalletAdapter(),
    ledger: new LedgerWalletAdapter(),
    
    // Дополнительные популярные кошельки
    bitget: new BitgetWalletAdapter(),
    clover: new CloverWalletAdapter(),
    coin98: new Coin98WalletAdapter(),
    mathwallet: new MathWalletAdapter(),
    torus: new TorusWalletAdapter(),
    xdefi: new XDEFIWalletAdapter(),
    
    // Специализированные кошельки
    bitpie: new BitpieWalletAdapter(),
    coinhub: new CoinhubWalletAdapter(),
    huobi: new HuobiWalletAdapter(),
    keystone: new KeystoneWalletAdapter(),
    krystal: new KrystalWalletAdapter(),
    onto: new OntoWalletAdapter(),
    saifu: new SaifuWalletAdapter(),
    sky: new SkyWalletAdapter(),
    spot: new SpotWalletAdapter(),
    tokenary: new TokenaryWalletAdapter(),
    tokenpocket: new TokenPocketWalletAdapter(),
  }

  static currentAdapter: WalletAdapter | null = null
  static isConnected: boolean = false
  static connection: Connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet))
  // static connection: Connection = new Connection(
  //   'https://snowy-sleek-ensemble.solana-devnet.quiknode.pro/ebfc31a05c0b5b2d3fea04c3abe6692bc49031af/'
  // )

  static async init() {
    const balance = await this.getBalance()
    useWalletStore.setState({ balance: { sol: balance.sol, usdt: balance.usdt } })
    useWalletModalStore.setState({ isOpen: false })
    useWalletStore.setState({ isConnected: true })
  }

  static selectWallet(name: WalletName) {
    console.log('selectWallet' + name)
    const wallet = this.findWalletByName(name)
    const isAviliable = this.checkIsAviliableWallet(name)

    console.log('wallet', wallet)
    console.log('isAviliable', isAviliable)

    // if (!wallet) return console.warn(`Кошелёк ${name} не найден`)
    // if (!isAviliable) return console.warn(`Кошелёк ${name} не установлен`)

    this.currentAdapter = wallet
    
    this.currentAdapter?.connect().then(() => {
      const isConnected = this.currentAdapter?.connected || false
    
      if (isConnected) this.init()
      if (!isConnected) this.currentAdapter = null
    }).catch((e) => {
      console.log('error', e)
    })
  }

  static checkIsAviliableWallet(name: WalletName): boolean {
    const wallet = this.findWalletByName(name)

    if (!wallet || wallet.readyState !== WalletReadyState.Installed) return false
    return true
  }

  static getWalletNameByAdapterKey(adapterKey: keyof typeof this.adapters): WalletName {
    const adapter = this.adapters[adapterKey]
    return adapter.name
  }

  static getAdapterKeyByWalletName(walletName: WalletName): keyof typeof this.adapters | null {
    const foundKey = Object.keys(this.adapters).find(
      (key) => this.adapters[key as keyof typeof this.adapters].name === walletName
    )
    return (foundKey as keyof typeof this.adapters) || null
  }

  static getPublicKey(): string {
    if (!this.currentAdapter || !this.isConnected) return ''
    return this.currentAdapter.publicKey!.toString()
  }

  static async getBalance(): Promise<{ sol: number; usdt: number }> {
    const solBalance = await this.getSolBalance()
    const usdtBalance = await this.getUsdtBalance()

    useWalletStore.setState({ balance: { sol: solBalance, usdt: usdtBalance } })

    return { sol: solBalance, usdt: usdtBalance }
  }

  private static async getSolBalance(): Promise<number> {
    if (!this.currentAdapter) return 0
    if (!this.currentAdapter.publicKey) return 0

    const balanceLamports = await this.connection.getBalance(this.currentAdapter.publicKey)
    const balance = balanceLamports / 10 ** LAMPORTS_PER_SOL

    return this.formatBalance(balance)
  }

  private static async getUsdtBalance(): Promise<number> {
    if (!this.currentAdapter) return 0
    if (!this.currentAdapter.publicKey) return 0

    const owner = this.currentAdapter.publicKey
    const ata = await getAssociatedTokenAddress(USDT_MINT, owner)

    try {
      const account = await getAccount(this.connection, ata)
      const balance = Number(account.amount) / 1e6

      return this.formatBalance(balance)
    } catch {
      return 0
    }
  }

  private static formatBalance(balance: number): number {
    return Number(balance.toFixed(2))
  }

  private static findWalletByName(name: WalletName): WalletAdapter | null {
    return Object.values(this.adapters).find((wallet) => wallet.name === name) || null
  }

  static async send(
    to: PublicKey | string,
    amount: number,
    currency: 'sol' | 'usdt'
  ): Promise<string> {
    if (currency === 'sol') return await this.sendSol(to, amount)
    return await this.sendSplToken(to, amount, USDT_MINT)
  }

  static async disconnect() {
    if (!this.currentAdapter) return
    await this.currentAdapter.disconnect()
    console.log('disconnect', this.currentAdapter)

    this.currentAdapter = null
    this.isConnected = false

    useWalletStore.setState({ balance: { sol: 0, usdt: 0 } })
    useWalletStore.setState({ isConnected: false })
  }

  private static async sendSol(toPubKey: PublicKey | string, amount: number): Promise<string> {
    if (!this.currentAdapter) {
      console.error('Wallet not connected')

      throw new Error('Wallet not connected')
    }
    if (!this.currentAdapter.publicKey) throw new Error('Public key not available')
    if (!this.currentAdapter.sendTransaction)
      throw new Error('Wallet does not support sending transactions')

    try {
      console.log(
        `Sending ${Number(
          amount
        )} SOL to ${toPubKey} from ${this.currentAdapter.publicKey.toBase58()}`
      )

      const toPublicKey = typeof toPubKey === 'string' ? new PublicKey(toPubKey) : toPubKey

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.currentAdapter.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      )

      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.currentAdapter.publicKey

      const signature = await this.currentAdapter.sendTransaction(transaction, this.connection, {
        preflightCommitment: 'processed',
        skipPreflight: false,
        maxRetries: 3,
      })

      await this.confirmTransaction(signature)
      await this.getBalance()

      console.log(`Sent ${Number(amount)} SOL to ${toPubKey}`)
      return signature
    } catch (e) {
      throw e
    }
  }

  private static async sendSplToken(
    receiverPublicKey: PublicKey | string,
    amount: number,
    mintAddress: PublicKey = USDT_MINT
  ): Promise<string> {
    if (!this.currentAdapter) throw new Error('Wallet not connected')
    if (!this.currentAdapter.publicKey) throw new Error('Public key not available')
    if (!this.currentAdapter.sendTransaction)
      throw new Error('Wallet does not support sending transactions')

    try {
      const receiver =
        typeof receiverPublicKey === 'string' ? new PublicKey(receiverPublicKey) : receiverPublicKey

      const senderTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        this.currentAdapter.publicKey
      )

      const receiverTokenAccount = await getAssociatedTokenAddress(mintAddress, receiver)

      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        receiverTokenAccount,
        this.currentAdapter.publicKey,
        amount * 1e6,
        []
      )

      const transaction = new Transaction().add(transferInstruction)

      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.currentAdapter.publicKey

      const signature = await this.currentAdapter.sendTransaction(transaction, this.connection, {
        preflightCommitment: 'processed',
        skipPreflight: false,
        maxRetries: 3,
      })

      await this.confirmTransaction(signature)

      await this.getBalance()

      console.log(`Sent ${amount} USDT to ${receiverPublicKey}`)
      return signature
    } catch (e) {
      console.error(`[ERROR]: Sending SPL token failed:`, e)
      throw e
    }
  }

  static async airdrop(lamports: number): Promise<string> {
    if (!this.currentAdapter) throw new Error('Wallet not connected')
    if (!this.currentAdapter.publicKey) throw new Error('Public key not available')

    const signature = await this.connection.requestAirdrop(this.currentAdapter.publicKey, lamports)

    await this.confirmTransaction(signature)
    await this.getBalance()

    console.log(`Airdropped ${lamports} lamports to ${this.currentAdapter.publicKey.toBase58()}`)
    return signature
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
}

export { Wallets }
