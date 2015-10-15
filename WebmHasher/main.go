package main

import (
	"flag"
	"fmt"
	"github.com/Dim0N22/go-phash"
	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"strconv"
	"strings"
)

type Webm struct {
	Id       bson.ObjectId `json:"id" bson:"_id"`
	FileInfo struct {
		Path string `json:"path" bson:"path"`
	} `json:"file_info" bson:"file_info"`
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

var (
	MongodbUrl  = flag.String("m", "mongodb://127.0.0.1", "MongoDb url")
	RabbitMqUrl = flag.String("p", "amqp://linux:123@127.0.0.1:5672/", "RabbitMQ url and port")
)

func main() {
	flag.Parse()

	mongoSession, err := mgo.Dial(*MongodbUrl)
	check(err)
	defer mongoSession.Close()
	webmCollection := mongoSession.DB("4webm").C("webms")

	amqpConnection, err := amqp.Dial(*RabbitMqUrl)
	check(err)
	defer amqpConnection.Close()

	channel, err := amqpConnection.Channel()
	check(err)
	defer channel.Close()

	hashQueue, err := channel.QueueDeclare(
		"webmPhashCalculator",
		true,
		false,
		false,
		false,
		nil,
	)
	check(err)

	doubleCheckerQueue, err := channel.QueueDeclare(
		"webmDoubleChecker",
		true,
		false,
		false,
		false,
		nil,
	)
	check(err)

	err = channel.Qos(1, 0, false)
	check(err)

	msgs, err := channel.Consume(
		hashQueue.Name,
		"WebmHashCalculator",
		false,
		false,
		false,
		false,
		nil,
	)
	check(err)

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			webm := &Webm{}
			objId := bson.ObjectId(msg.Body)
			webmCollection.FindId(objId).One(&webm)

			fmt.Println(webm)

			hash, err := phash.VideoHashDCT(webm.FileInfo.Path)
			check(err)

			var shash []string
			for _, h := range hash {
				shash = append(shash, strconv.FormatUint(h, 10))
			}

			err = webmCollection.UpdateId(webm.Id, bson.M{"$set": bson.M{"hasharr": shash}})
			check(err)

			err = channel.Publish(
				"",
				doubleCheckerQueue.Name,
				false,
				false,
				amqp.Publishing{
					DeliveryMode: amqp.Persistent,
					ContentType:  "text/plain",
					Body:         []byte(webm.Id),
				})
			check(err)

			msg.Ack(false)
		}
	}()

	<-forever
}
