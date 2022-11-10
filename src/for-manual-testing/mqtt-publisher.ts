import * as MQTT from 'async-mqtt'

import { log } from '../log'

const MQTT_BROKER = 'tcp://localhost:1883'
const MQTT_TOPIC = 'dimo-test'

const main = async () => {
	log(`Connecting to MQTT broker at ${MQTT_BROKER}...`)
	const mqtt = await MQTT.connectAsync(MQTT_BROKER)

	setInterval(async () => {
		const message = { foo: 'bar' }
		await mqtt.publish(MQTT_TOPIC, JSON.stringify(message))
		log(`Published to MQTT topic ${MQTT_TOPIC}: ${JSON.stringify(message)}`)
	}, 3000)
}

main()
