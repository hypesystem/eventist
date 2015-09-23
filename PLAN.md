Before a major release, these are the capabilities eventist should have:

- It should be possible to run it distributed, in several instances of software, using the same event queue.
  This will probably necessitate some kind of distributed message queue.
  Using the AMQP protocol will allow the user to decide on which message queue implementation to use.
- It should support type-checking.
  Javascript is a dynamic language, but there may be requirements for events (required fields, etc.) that should be enforced centrally, so bogus events don't make it to the queue.
  A list of supported events and their requirements should be given at construction.
- There should be a standardized way of creating projections and snapshots of projections through the interface.
  Projections are "results of reading the event stream", and can be grouped by aggregate ID or simply global.
- It should be possible to listen to any number of events:
  a single event (as a string),
  some events (as an array of strings),
  or all events (by leaving out the argument).
- Low friction setup: if the `event_stream` table does not exist, it should be created with the first request.

It would be cool to look into:

- RxJS and observables --- basically iteration over events.
