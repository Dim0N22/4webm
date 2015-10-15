package main

import (
	"flag"
	"fmt"
	"github.com/Dim0N22/go-phash"
	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"log"
	"net/http"
	_ "net/http/pprof"
	"strconv"
)

type Webm struct {
	Id           bson.ObjectId `json:"id" bson:"_id"`
	HashesString []string      `json:"hasharr" bson:"hasharr"`
}

type MaxWebmId struct {
	Id        bson.ObjectId `json:"id" bson:"_id"`
	CurrentId int           `json:"currentId" bson:"currentId"`
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func getHashForWebm(webm *Webm) []uint64 {
	uintHash := []uint64{}

	for _, hash := range webm.HashesString {
		parsedUint64, err := strconv.ParseUint(hash, 10, 64)
		check(err)
		uintHash = append(uintHash, parsedUint64)
		if len(uintHash) == 1000 {
			break
		}
	}

	return uintHash
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
	seqIdCollection := mongoSession.DB("4webm").C("maxwebmid")
	mongoSession.SetBatch(1000)

	amqpConnection, err := amqp.Dial(*RabbitMqUrl)
	check(err)
	defer amqpConnection.Close()

	channel, err := amqpConnection.Channel()
	check(err)
	defer channel.Close()

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
		doubleCheckerQueue.Name,
		"WebmDoubleFinder",
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
			err := webmCollection.FindId(objId).One(&webm)

			// webm удалена из БД
			if err != nil {
				msg.Ack(false)
				continue
			}

			if len(webm.HashesString) == 0 {
				fmt.Println(webm)
				msg.Ack(false)
				continue
			}

			originalHash := getHashForWebm(webm)

			doubles := []bson.ObjectId{}

			iter := webmCollection.Find(bson.M{"$and": []interface{}{
				bson.M{"hasharr.0": bson.M{"$exists": true}},
				bson.M{"_id": bson.M{"$ne": objId}},
				bson.M{"seqid": bson.M{"$exists": true}},
			}}).Iter()
			dWebm := &Webm{}
			for iter.Next(&dWebm) {
				dHash := getHashForWebm(dWebm)
				distance, err := phash.HammingDistanceForVideoHashes(originalHash, dHash, 10)
				check(err)
				if distance > 0.999 {
					doubles = append(doubles, dWebm.Id)
				}
			}

			if len(doubles) == 0 {
				change := mgo.Change{
					Update:    bson.M{"$inc": bson.M{"currentId": 1}},
					ReturnNew: true,
				}

				id := MaxWebmId{}
				_, err = seqIdCollection.Find(nil).Apply(change, &id)
				check(err)

				err = webmCollection.UpdateId(webm.Id, bson.M{"$set": bson.M{"seqid": id.CurrentId}})
				check(err)
			} else {
				err = webmCollection.UpdateId(webm.Id, bson.M{"$set": bson.M{"doubles": doubles}})
				check(err)
			}

			fmt.Println(webm.Id.Hex(), len(doubles))
			msg.Ack(false)
		}
	}()

	<-forever
}
