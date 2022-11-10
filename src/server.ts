import { ethers } from 'ethers'
import { once } from 'events'
import express from 'express'
import { signHashed } from './signingUtils'

const PORT = 9000
const WALLET = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001')

export const startMockServer = async () => {
    const app = express()
    app.use(express.json())
    app.post('/execute_raw', async (req, res) => {
        const command = req.body.command
        const [ commandId, commandParam ] = command.split(' ')
        switch (commandId) {
            case 'crypto.query':
                if (commandParam === 'ethereum_address') {
                    res.end(WALLET.address)
                } else {
                    throw new Error(`unknown query: ${commandParam}`)
                }
                break
            case 'crypto.sign_string':
                const payload = commandParam
                const signature = signHashed(Buffer.from(payload, 'hex'), WALLET.privateKey)
                res.end(signature)
                break
            default:
                throw new Error(`unknown command: ${commandId}`)
        }
    })
    const server = app.listen(PORT)
    await once(server, 'listening')
}