import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Connection, clusterApiUrl, ParsedTransactionWithMeta } from '@solana/web3.js'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SolanaService {
    connection: Connection

    constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
        const isProductuion = this.config.get('NODE_ENV') === 'production'
        const rpcUrl = clusterApiUrl('mainnet-beta')
        // const rpcUrl = this.config.get('SOLANA_RPC_URL') || clusterApiUrl(isProductuion ? 'mainnet-beta' : 'devnet')

        this.connection = new Connection(rpcUrl)
    }

    getTransactionData(signature: string): Promise<ParsedTransactionWithMeta | null> {
        const transaction = this.connection.getParsedTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        }).catch(() => null)

        return transaction
    }

    getConnection(): Connection {
        return this.connection
    }
}
