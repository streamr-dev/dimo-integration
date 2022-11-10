import { StreamrClient, MessageMetadata } from 'streamr-client'
import { log } from '../log'

const STREAM_ID = '0x66cc2122fe015aeb6dacd42d76b074b607c8c9e1/dimo-test'

const main = async () => {
    const subscriber = new StreamrClient({
        auth: {
            privateKey: '0x0000000000000000000000000000000000000000000000000000000000000002'
        },
        metrics: false
    })

	const sub = await subscriber.subscribe(STREAM_ID, (content: any, metadata: MessageMetadata) => {
        log(`Message received: ${JSON.stringify({ content, signature: metadata.signature })}`)
    })
    sub.on('error', (err: Error) => log(`Error: ${err.message}`))
}

main()
