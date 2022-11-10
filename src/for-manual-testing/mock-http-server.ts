import { ethers } from 'ethers'
import { once } from 'events'
import express from 'express'
import { signHashed } from '../signingUtils'
import { log } from '../log'

const PORT = 9000
const WALLET = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001')
const DONGLE_ID = 'f3c1df88-86d5-d7e6-f062-e8f0c62ad3ee'

export const startMockServer = async (dongleId: string) => {
    const app = express()
    app.use(express.json())
    app.post(`/dongle/${dongleId}/execute_raw`, async (req, res) => {
        const command = req.body.command
		log(`Command received: ${command}`)
        const [ commandId, commandParam ] = command.split(' ')
		let response
        switch (commandId) {
            case 'crypto.query':
                if (commandParam === 'ethereum_address') {
                    response = {
						_stamp: new Date().toISOString(),
						_type: 'ethereum_address',
						value: WALLET.address,
					}
                } else {
                    throw new Error(`unknown query: ${commandParam}`)
                }
                break
            case 'crypto.sign_string':
                const payload = commandParam
                const signature = signHashed(Buffer.from(payload, 'hex'), WALLET.privateKey)
				response = {
					_stamp: new Date().toISOString(),
					value: signature,
				}
                break
            default:
                throw new Error(`unknown command: ${commandId}`)
        }
		log(`Responding with: ${JSON.stringify(response)}`)
		res.end(JSON.stringify(response))
    })
    const server = app.listen(PORT)
    await once(server, 'listening')
}

startMockServer(DONGLE_ID)