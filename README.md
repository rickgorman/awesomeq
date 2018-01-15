# AwesomeQ

A fast in-memory message processing queue hosted by [express.js](http://expressjs.com) and exposed as a webservice.

## Features
* Will happily use lots of memory
* Doesn't cost much to run
* It's pretty fast

## Slightly-more-serious Features
* Supports creation of multiple topics
* Single-threaded model guaranteeing single-producer-single-consumer concurrency
* Supports multiple producers/consumers per topic
* (mostly) RESTful API
* Follows jsonapi.org specifications for response objects
* Handles MIA clients via a configurable retry timeout
* Push/Pop operations are always O(1)

## Contents
1. [Quick Start](#quick-start)
1. [Overview](#overview)
1. [API](#api)
1. [Monitoring](#monitoring)
1. [Testing](#testing)
1. [Current Bottlenecks and Thoughts on Future Scaling](#current-bottlenecks-and-thoughts-on-future-scaling)
1. [TODO](#todo)
1. [License](#license)

## Quick Start

Requirements: a working [node.js](http://nodejs.org) environment, a console and 2-3 minutes to spare.

1. **Install and launch the server:**
    * `git clone https://github.com/rickgorman/awesomeq.git`
    * `npm install`
    * `npm run server`

1. **Add some messages to the queue.** From a separate console:
    * `npm run client-publisher`

1. **Process some messages.** From yet a third console:
    * `npm run client-consumer`

1. **Monitor all the things.** In console numero 4, run:
    * `npm run monitor`

## Overview

AwesomeQ allows the creation of multiple independent message queues under a single-threaded model. This provides an implicit atomic wrapper around each sendMessage/receiveMessage request, guaranteeing that only a single consumer will be working on a given message at any time. The single-threaded model also guarantees that there will be no race conditions between producer and consumer.

Each queue is referred to as a `topic`, not to be confused with the [Pub/Sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) usage of the term. Messages added to a topic will exist until they are received by a consumer **and acknowledged as successfully processed**.

If the queue does not hear back from the consumer after a specified delay, the message will then be available to another consumer for processing.

## API
* `GET /` - List all available topics by id:
  ```javascript
  {
    data: [
      {
        id: 0,
        name: "First topic"
      },
      {
        id: 1,
        name: "Second topic"
      },
    ]
  }
  ```
* `POST /` - Create a new topic
  * **Parameters:**
    * `name` - Desired topic name
    * `processTimeout` - The amount of time (in ms) a consumer is allowed to process a message, after which the message is available to be processed by another consumer (default: 60000).
  * **On success:**
    * `200` Returns details about the created topic:
      ```javascript
      {
        data: [{
          id: 1,
          name: "Some Topic",
        }]
      }
      ```
  * **On failure:**
    * `400` Generic failure:
        ```javascript
        {
          errors: [{
            title: "Cause of the error",
            detail: "More details"              
          }]
        }
        ```
    * `409` Failure due to an existing topic with the same name:
        ```javascript
        {
          errors: [{
            title: "Duplicate topic name",
            detail: "name-of-the-topic"
          }]
        }
        ```
* `GET /:topicId` - Receive detailed status information on the specified topic
  * **On success:**
    * `200` Returns details about the given topic:
      ```javascript
      {  
        data: [{
          id: 1,
          name: "Topic Name",
          attributes: {
            messagesInQueue: 14,
            messagesProcessed: 37,
            messagesBeingProcessed: 3,
            createdAt: "2018-01-13T03:24:00.000Z",
            processTimeout: 60000,
            statistics: {
              singleFailures: 1,
              multipleFailures: 0,
              unprocessableMessages: 0,
              averageProcessingTimeMS: 23,              
            }
          },
        }],
      }
      ```
  * **On failure:**
    * `404` Failure due to a non-existing topic:
      ```javascript
      {
        errors: [{
          title: "Non-existing topic",
          detail: "name-of-the-topic"
        }]
      }
      ```
  * Further explanation of parameters:
    * `singleFailures` - messages that took **2 attempts** to successfully process
    * `multipleFailures` - messages that took **more than 2 attempts** to successfully process
    * `unprocessableMessages` - messages that failed processing after **5 attempts**
* `GET /:topic/receiveMessage` - Retrieve one message from the specified queue.
  * **On success:**
    * `200` Returns a JSONAPI representation of a message:
      ```javascript
      {
        data: [{
          id: 0,
          body: "foo",
          createdAt: "2018-01-13T03:25:00.000Z",
          processAttempts: 0,
        }],
        relationships: {
          topic: {
            data: {
              id: 1
            }
          }
        }
      }
      ```
    * `204` There are no messages available in the given topic.
  * **Implementation Details**
    * When a consumer checks out a message and does not mark it successful before `processTimeout` elapses, that message will be added back to the front of the queue for immediate reprocessing.
* `POST /:topic` - Add a message to the given topic:
  * **Parameters:**
    * `messageBody` - A string representing the body of the message.
  * **On success:**
    * `200` Returns a reference to the newly-created message:
      ```javascript
      {
        data: [{
          id: 0,
          body: "foo",
          createdAt: "2018-01-13T03:25:00.000Z",
          processAttempts: 0,
        }],
        relationships: {
          topic: {
            data: {
              id: 1
            }
          }
        }
      }
      ```
  * **On failure:**
    * `422` Invalid body (likely too long):
      ```javascript
      {
        errors: [{
          title: "Invalid body",
          detail: "Body string exceeds maximum length (xyz bytes)"
        }]
      }
      ```
* `DELETE /:topic/:messageId` - Acknowledge a message as successfully processed and mark it for deletion.
  * **On success:**
    * `200` Return final processing details of the message:
      ```javascript
      {
        data: [{
          id: 1,
          processAttempts: 1,
          createdAt: "2018-01-13T03:25:00.000Z",
          processingBeganAt: "2018-01-13T03:27:00.000Z",
          processingCompletedAt: "2018-01-13T03:27:05.000Z",
          processDurationMS: 5000
        }],
        relationships: {
          topic: {
            data: {
              id: 1
            }
          }
        }
      }
      ```
  * **On failure:**
    * `404` Message is no longer in the queue. Consumers with delays longer than `processTimeout` may encounter this status code.

## Testing

AwesomeQ includes a test suite built with [mocha](https://mochajs.org/) and configured to run with ES6.

To run the test suite, open a console and enter:

`# npm run test`

## Monitoring

Use the CLI tool to monitor the status of all topics:

`# npm run monitor`

[insert giphy here]

## Current Bottlenecks and Thoughts on Future Scaling

  * Where it would fail
    * Eventually this single instance of node will become overwhelmed by the number of requests coming in per second. It will not be able to keep up with the HTTP request queue and will eventually run out of RAM and/or CPU.
  * What would be replaced
    * **Summary**
      * The in-memory O(1) queue will need to be replaced by a persistent O(log n) data store.
      * The single-instance node server will need to be replaced by a more scalable HTTP handler.
    * **Server-side**
      * [AWS Lambda](https://aws.amazon.com/lambda/). It has unlimited automatic scaling and pricing is very cost effective. The monthly fee for 1k requests per second with a memory footprint of 32MB/request is around $1900/mo.
      * [AWS DynamoDB](https://aws.amazon.com/dynamodb). It has extreme read scalability and integrates well with Lambda. With proper indexing, reads and writes will complete in O(log n) time. Pricing for 1k requests per second runs at $105/mo. Storage is negligible for our use case.
      * This gives us a pricing estimate of $2000/mo. Similar AWS SQS pricing for 1k requests per second runs $1200/mo so we're well within a factor of 2 of an optimized AWS service offering. By bringing down the memory footprint of our node module, we may be able to reach SQS pricing parity.
    * **Client-side**
      * Implement websockets capability for clients. This has a couple of immediate benefits:
        * Reduce HTTP overhead for clients that do continuous work.
        * Automate retries by triggering when a client disconnects. For MIA clients this will immediately put their messages back in the ready queue.
      * Implement `sendMessageBatch` and `receiveMessageBatch` API endpoints. This will reduce the websockets overhead by a magnitude or more, depending on batch size.

## TODO
* Implement more API methods:
  * deleteMessage
  * deleteMessageBatch
  * deleteQueue
  * purgeQueue
  * sendMessageBatch
  * receiveMessageBatch
* Do not trust the client's reporting of `Message.processCounter`
* Mock secondary classes in test suite
* Add custom Error classes

## License

<a rel="license" href="http://www.wtfpl.net/">WTFPL</a>
