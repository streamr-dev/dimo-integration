import fetch from 'node-fetch'
import { log } from './log'
import { CustomProvider } from './custom-provider';

interface Response {
    _stamp: string
    _type?: string
    value: string
}

/**
 * A custom provider / signer that connects to the HTTP interface of the HSM module on the DIMO device.
 */
export class DIMOProvider extends CustomProvider {
    private dongleId: string;

    constructor(dongleId: string) {
        super()
        this.dongleId = dongleId
    }

    public async getAddress() {
        const result = await this.sendCommand('crypto.query ethereum_address')
        return result.value
    }

    public async signHash(msgHash: Buffer) {
        const response = await this.sendCommand(`crypto.sign_string ${msgHash.toString('hex')}`)
        return response.value
    }

    private sendCommand = async (command: string): Promise<Response> => {
        const request = JSON.stringify({ command })
        log(`API request: ${request}`)
        const response = await fetch(`http://localhost:9000/dongle/${this.dongleId}/execute_raw/`, {
            body: request,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const jsonResponse = await response.json()
        log('API response: ' + JSON.stringify(jsonResponse))
        return jsonResponse
    }

}
