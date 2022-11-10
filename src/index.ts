import { StreamrClient, ConfigTest, MessageMetadata, StreamPermission } from 'streamr-client'
import { DIMOProvider } from './provider'
import { startMockServer } from './server'

const log = (msg: string) => console.log(`${msg}\n`)

const DONGLE_ID = 'f3c1df88-86d5-d7e6-f062-e8f0c62ad3ee'
const STREAM_ID = '0x66cc2122fe015aeb6dacd42d76b074b607c8c9e1/dimo-test'

const main = async () => {
    await startMockServer(DONGLE_ID)

	const provider = new DIMOProvider(DONGLE_ID)
	log(`Ethereum address of the device is ${await provider.getAddress()}`)

    const subscriber = new StreamrClient({
        auth: {
            privateKey: '0x0000000000000000000000000000000000000000000000000000000000000002'
        },
        metrics: false
    })
    const sub = await subscriber.subscribe(STREAM_ID, (content: any, metadata: MessageMetadata) => {
        log(`Subscriber received: ${JSON.stringify({ content, signature: metadata.signature })}`)
        process.exit(0)
    })
    sub.on('error', (err: Error) => log(`Error: ${err.message}`))

    const publisher = new StreamrClient({
        auth: {
            ethereum: provider,
        },
        metrics: false
    })
    log('Publisher client address: ' + await publisher.getAddress())
    const stream = await publisher.getStream(STREAM_ID)
	
    const msg = await stream.publish({ foo: 'bar' })
    log(`Publisher sent: ${JSON.stringify({ content: msg.content, signature: msg.signature })}`)
}

main()
