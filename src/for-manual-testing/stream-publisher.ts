import { StreamrClient } from 'streamr-client'
import { log } from '../log'

const STREAM_ID = '0x66cc2122fe015aeb6dacd42d76b074b607c8c9e1/dimo-test'

const main = async () => {
    const publisher = new StreamrClient({
        auth: {
            privateKey: '0x0000000000000000000000000000000000000000000000000000000000000001'
        },
        metrics: false
    })
    const stream = await publisher.getStream(STREAM_ID)

    setInterval(async () => {
        const msg = await stream.publish({ foo: 'bar' })
        log(`Publisher sent: ${JSON.stringify({ content: msg.content, signature: msg.signature })}`)
    }, 3000)
}

main()
