import fetch from 'node-fetch'
import { ExternalProvider } from 'streamr-client';
import { hash } from './signingUtils'

const CHAIN_ID = 12345 // irrelevant for signing messages

const log = (msg: string) => console.log(`${msg}\n`)

export class DIMOProvider implements ExternalProvider {
	private dongleId: string;

	constructor(dongleId: string) {
		this.dongleId = dongleId
	}

	private sendCommand = async (command: string): Promise<string> => {
		const request = JSON.stringify({ command })
		log(`API request: ${request}`)
		const response = await fetch(`http://localhost:9000/dongle/${this.dongleId}/execute_raw/`, {
			body: request,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		const responseText = response.text()
		log('API response: ' + (await responseText))
		return responseText
	}

	// ExternalProvider
	public async request(request: any): Promise<any> {
		const { method, params } = request
		log(`Ethereum request: ${method}`)
		switch (method) {
			case 'eth_requestAccounts':
			case 'eth_accounts':
				const address = await this.getAddress()
				return [address]
			case 'personal_sign':
				const payloadHex = params[0]
				const payload = Buffer.from(payloadHex.substring(2), 'hex')
				log(`Ethereum request payload: ${payload.toString('utf-8')}`)
				const msgHash = hash(payload)
				return await this.sendCommand(`crypto.sign_string ${msgHash.toString('hex')}`)
			case 'eth_chainId':
				return CHAIN_ID
			default:
				throw new Error(`unknown method: ${method}`)
		}
	}

	public async getAddress() {
		return this.sendCommand('crypto.query ethereum_address')
	}

}
