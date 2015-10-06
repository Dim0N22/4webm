package main

import (
	"fmt"
	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"os/exec"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
	mongoSession, err := mgo.Dial("mongodb://localhost")
	check(err)
	defer mongoSession.Close()
	webmCollection := mongoSession.DB("4webm").C("webms")

	amqpConnection, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	check(err)
	defer amqpConnection.Close()

	channel, err := amqpConnection.Channel()
	check(err)
	defer channel.Close()

	thumbnailQueue, err := channel.QueueDeclare(
		"webmThumbnailer",
		true,
		false,
		false,
		false,
		nil,
	)
	check(err)

	pHashQueue, err := channel.QueueDeclare(
		"webmPhashCalculator",
		true,
		false,
		false,
		false,
		nil,
	)

	err = channel.Qos(1, 0, false)

	thumbnailMsgs, err := channel.Consume(
		thumbnailQueue.Name,
		"WebmProcessor",
		false,
		false,
		false,
		false,
		nil,
	)
	check(err)

	forever := make(chan bool)

	go func() {
		for msg := range thumbnailMsgs {
			webm := &Webm{}
			objId := bson.ObjectId(msg.Body)
			webmCollection.FindId(objId).One(&webm)

			fmt.Println("processing: " + webm.FileInfo.Path)
			err := exec.Command("D://PROJECTS/Go/src/4webm/ffmpeg.exe", "-i", webm.FileInfo.Path, "-deinterlace", "-vframes", "1", "-vf", "scale='if(gte(iw,ih),300,-1)':'if(gt(ih,iw),300,-1)'", "-y", webm.FileInfo.Path+".300x300.jpg").Run()
			fmt.Println(err)
			fmt.Println("End processing: " + webm.FileInfo.Path)

			channel.Publish(
				"",
				pHashQueue.Name,
				false,
				false,
				amqp.Publishing{
					DeliveryMode: amqp.Persistent,
					ContentType:  "text/plain",
					Body:         []byte(objId),
				})

			msg.Ack(false)
		}
	}()

	<-forever
}
