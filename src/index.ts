import fetch from 'node-fetch'
import { ethers } from 'ethers'
import { StreamrClient, ConfigTest, ExternalProvider, MessageMetadata, StreamPermission } from 'streamr-client'
import { startMockServer } from './server'
import { hash } from './signingUtils'

const log = (msg: string) => console.log(`${msg}\n`)

const fetchFromAPI = async (command: string): Promise<string> => {
    const request = JSON.stringify({ command })
    log(`API request: ${request}`)
    const response = await fetch('http://localhost:9000/execute_raw', {
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

const createExternalProvider = (chainId: number): ExternalProvider => {
    return {
        request: async (request: any): Promise<any> => {
            const { method, params } = request
            log(`Ethereum request: ${method}`)
            switch (method) {
                case 'eth_requestAccounts':
                case 'eth_accounts':
                    const address = await fetchFromAPI('crypto.query ethereum_address')
                    return [address]
                case 'personal_sign':
                    const payloadHex = params[0]
                    const payload = Buffer.from(payloadHex.substring(2), 'hex')
                    log(`Ethereum request payload: ${payload.toString('utf-8')}`)
                    const msgHash = hash(payload)
                    return await fetchFromAPI(`crypto.sign_string ${msgHash.toString('hex')}`)
                case 'eth_chainId':
                    return chainId
                default:
                    throw new Error(`unknown method: ${method}`)
            }
        }
    }
}

const main = async () => {

    await startMockServer()

    const subscriber = new StreamrClient({
        ...ConfigTest,
        auth: {
            privateKey: '0x0000000000000000000000000000000000000000000000000000000000000002'
        },
        metrics: false
    })
    const streamId = (await subscriber.createStream(`/dimo-test/${Date.now()}`)).id
    const sub = await subscriber.subscribe(streamId, (content: any, metadata: MessageMetadata) => {
        log(`Subscriber received: ${JSON.stringify({ content, signature: metadata.signature })}`)
        process.exit(0)
    })
    sub.on('error', (err: Error) => log(`Error: ${err.message}`))
    await subscriber.grantPermissions(streamId, {
        public: true,
        permissions: [StreamPermission.PUBLISH, StreamPermission.SUBSCRIBE]
    })

    const publisher = new StreamrClient({
        ...ConfigTest,
        auth: {
            ethereum: createExternalProvider(ConfigTest.streamRegistryChainRPCs!.chainId!)
        },
        metrics: false
    })
    log('Publisher client address: ' + await publisher.getAddress())
    const stream = await publisher.getStream(streamId)
    const msg = await stream.publish({ foo: 'bar' })
    log(`Publisher sent: ${JSON.stringify({ content: msg.content, signature: msg.signature })}`)
}

main()
