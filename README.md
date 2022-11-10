# dimo-integration

- `npm start` - Main program - Subscribes on the local MQTT broker and publishes messages to Streamr, signs messages using the HTTP interface

## Useful stuff for manual testing

- `npm run mock-server` - Runs a mock HTTP server on port 9000 that signs hashes with a hard-coded private key
- `npm run mqtt-publisher` - Publishes messages at regular intervals to a test topic on the local MQTT broker
- `npm run stream-subscriber` - Subscribes to the test stream and prints messages to console
- `npm run stream-publisher` - Publishes messages at regular intervals to the test stream

