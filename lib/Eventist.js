var uuid = require("uuid");
var moment = require("moment");
var cu = require("cubeio-js-util");
var pg = require("pg");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var Eventist = function(connectionString) {
    this.connectionString = connectionString;
    EventEmitter.call(this);
};
util.inherits(Eventist, EventEmitter);

Eventist.prototype.send = function(eventType, data, aggregateId, callback) {
    if(!callback) {
        callback = aggregateId;
        aggregateId = uuid.v4();
    }

    var timestamp = moment();

    pg.connect(this.connectionString, cu.p(callback, function(client, done) {
        var values = "'" + [
            JSON.stringify(data),
            eventType,
            timestamp.toISOString(),
            aggregateId
        ].join("','") + "'";
        client.query("INSERT INTO event_stream (data, event_type, timestamp, aggregate_id) VALUES (" + values + ")", cu.p(callback, function() {
            done();
            this.emit(eventType, {
                data: data,
                eventType: eventType,
                aggregateId: aggregateId,
                timestamp: timestamp
            });
            callback(null, aggregateId);
        }.bind(this)));
    }.bind(this)));
};

Eventist.prototype.readAll = function(eventType, handler) {
    this.on(eventType, handler);
    pg.connect(this.connectionString, function(error, client, done) {
        if(error) {
            return console.error("FAILED to read event stream (connection failed)", error);
        }
        client.query("SELECT * FROM event_stream WHERE event_type = '" + eventType + "'", function(error, result) {
            done();
            if(error) {
                return console.error("FAILED to read event stream (could not read event stream)", error);
            }
            result.rows.forEach(function(row) {
                var event = {
                    data: row.data,
                    eventType: row.event_type,
                    aggregateId: row.aggregate_id,
                    timestamp: row.timestamp
                };
                this.emit(eventType, event);
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

module.exports = Eventist;
