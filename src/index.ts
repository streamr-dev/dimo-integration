import { StreamrClient } from 'streamr-client'
import * as MQTT from 'async-mqtt'
import { DIMOProvider } from './dimo-provider'
import { log } from './log'

const DONGLE_ID = 'f3c1df88-86d5-d7e6-f062-e8f0c62ad3ee'
const MQTT_BROKER = 'tcp://localhost:1883'
const MQTT_TOPIC = '#'
const STREAM_ID = '0x66cc2122fe015aeb6dacd42d76b074b607c8c9e1/dimo-test'

const main = async () => {
	const provider = new DIMOProvider(DONGLE_ID)
	log(`Publisher address: ${await provider.getAddress()}`)

	log(`Connecting to MQTT broker at ${MQTT_BROKER}...`)
	const mqtt = await MQTT.connectAsync(MQTT_BROKER)

    const streamr = new StreamrClient({
        auth: {
            ethereum: provider,
        },
        metrics: false
    })
	log(`Fetching target stream ${STREAM_ID}...`)
    const stream = await streamr.getStream(STREAM_ID)

	log(`Subscribing to MQTT messages on topic ${MQTT_TOPIC}`)
	await mqtt.subscribe(MQTT_TOPIC)

	mqtt.on('message', async (topic, message) => {
		log(`Message from MQTT topic ${topic}: ${message}`)

		const msg = await stream.publish(message)
		log('Message was published to stream!')
	})
}

main()
