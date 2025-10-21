import Bottleneck from 'bottleneck'
import { Connection, PublicKey } from '@solana/web3.js'

export interface ProxyConnectionConfig {
  readLimiter: Bottleneck
  writeLimiter: Bottleneck
}

/**
 * Creates a proxy connection that wraps Solana Connection with rate limiting
 * @param conn - The original Solana Connection
 * @param config - Configuration with read and write limiters
 * @returns A Connection-like object with rate-limited methods
 */
export function makeProxyConnection(
  conn: Connection,
  config: ProxyConnectionConfig
): Connection {
  const { readLimiter, writeLimiter } = config

  // Create a new object that extends the original connection
  const proxyConn = Object.create(conn)

  // Override specific methods with rate limiting
  proxyConn.getBalance = (pub: PublicKey, commitment?: any) =>
    readLimiter.schedule(() => conn.getBalance(pub, commitment))

  proxyConn.getParsedTransaction = (sig: string, options?: any) =>
    readLimiter.schedule(() => conn.getParsedTransaction(sig, options))

  proxyConn.getTransaction = (sig: string, options?: any) =>
    readLimiter.schedule(() => conn.getTransaction(sig, options))

  proxyConn.getTokenAccountBalance = (pub: PublicKey) =>
    readLimiter.schedule(() => conn.getTokenAccountBalance(pub))

  proxyConn.getParsedTokenAccountsByOwner = (owner: PublicKey, filter: any) =>
    readLimiter.schedule(() => conn.getParsedTokenAccountsByOwner(owner, filter))

  proxyConn.getTokenSupply = (mint: PublicKey) =>
    readLimiter.schedule(() => conn.getTokenSupply(mint))

  proxyConn.getAccountInfo = (pub: PublicKey, commitment?: any) =>
    readLimiter.schedule(() => conn.getAccountInfo(pub, commitment))

  proxyConn.getLatestBlockhash = (commitment?: any) =>
    readLimiter.schedule(() => conn.getLatestBlockhash(commitment))

  // Write operations - use writeLimiter
  proxyConn.sendRawTransaction = (raw: Buffer, opts?: any) =>
    writeLimiter.schedule(() => conn.sendRawTransaction(raw, opts))

  proxyConn.confirmTransaction = (opts: any, commitment?: any) =>
    writeLimiter.schedule(() => conn.confirmTransaction(opts, commitment))

  // Additional methods that might be used
  proxyConn.getSlot = (commitment?: any) =>
    readLimiter.schedule(() => conn.getSlot(commitment))

  proxyConn.getBlockHeight = (commitment?: any) =>
    readLimiter.schedule(() => conn.getBlockHeight(commitment))

  return proxyConn as Connection
}
