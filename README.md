# dimo-integration

## Requirements

- node.js 16+
- MQTT server running on port 1883
- HTTP interface (real or mock) on port 9000

## Running

- `npm ci`
- `npm start` - Main program - Subscribes on the local MQTT broker and publishes messages to Streamr, signs messages using the HTTP interface

## Useful runnables for manual testing

- `npm run mock-server` - Runs a mock HTTP server on port 9000 that signs hashes with a hard-coded private key
- `npm run mqtt-publisher` - Publishes messages at regular intervals to a test topic on the local MQTT broker
- `npm run stream-subscriber` - Subscribes to the test stream and prints messages to console
- `npm run stream-publisher` - Publishes messages at regular intervals to the test stream

## File highlights:

- [CustomProvider](src/custom-provider.ts) - An abstract class which wraps the relevant part of the provider interface into a few methods to be implemented by custom signer implementations, possibly very useful for others too
- [DIMOProvider](src/dimo-provider.ts) - Extends `CustomProvider` and implements the address fetching and signing via the HTTP interface that wraps the HSM
- [index.ts](src/index.ts) - The main runnable, starts the clients and wires them together
