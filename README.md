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
            singleFailures: 1,
            multipleFailures: 0,
            unprocessableMessages: 0,
            createdAt: "2018-01-13T03:24:00.000Z",
            processTimeout: 60000,
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
* `GET /:topic/receiveMessage?quantity=[1-10]` - Retrieve one or more messages up to max(quantity, queueLength) from the specified queue where quantity is at most 10. If unspecified, `quantity` will default to `1`.
  * **On success:**
    * `200` Returns an array of messages:
      ```javascript
      {
        data: [
          {
            id: 0,
            content: "foo",
            createdAt: "2018-01-13T03:25:00.000Z",
            processAttempts: 0,
          },
          {
            id: 1,
            content: "bar",
            createdAt: "2018-01-13T03:26:00.000Z",
            processAttempts: 2,
          },
        ]
      }
      ```
    * `204` There are no messages in the given topic.
* `POST /:topic` - Add a message to the given topic:
  * **Parameters:**
    * `messageBody` - A string representing the content of the message.
  * **On success:**
    * `200` Returns a reference to the newly-created message:
      ```javascript
      {
        data: [{
          id: 0,
          topicId: 0,
          content: "foo",
          createdAt: "2018-01-13T03:25:00.000Z",
          processAttempts: 0,
        }]
      }
      ```
  * **On failure:**
    * `422` Invalid content (likely too long):
      ```javascript
      {
        errors: [{
          title: "Invalid content",
          detail: "Content string exceeds maximum length (xyz bytes)"
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
          processDurationMS: 5000,
        }]
      }
      ```
  * **On failure:**
    * `404` Message is no longer in the queue. Consumers with delays longer than `processTimeout` may encounter this status code.

## Monitoring

Use the CLI tool to monitor the status of all topics:

`npm run monitor`

[insert giphy here]

## Current Bottlenecks and Thoughts on Future Scaling

* How to meet high-volume requests
  * Where it would fail
  * What would be replaced
  * What infrastructure / why
    * spin up multiple instances of the node server and use one of the following strategies:
      * round-robin
      * load-balancer
    * additionally, transition from in-memory data store to a fast persistent-storage system like DyanmoDB
    * Implement websockets infrastructure
      * to reduce HTTP overhead
      * to automate retries by triggering when a client disconnects

## TODO
* Implement more API methods:
  * deleteMessage
  * deleteMessageBatch
  * deleteQueue
  * purgeQueue
  * sendMessageBatch

## License

<a rel="license" href="http://www.wtfpl.net/">WTFPL</a>
