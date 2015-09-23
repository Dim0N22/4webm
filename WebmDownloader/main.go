package main

import (
	"fmt"
	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"hash/adler32"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"path"
	"strconv"
	"time"
	"strings"
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

	queue, err := channel.QueueDeclare(
		"webmDownload",
		true,
		false,
		false,
		false,
		nil,
	)
	check(err)

	err = channel.Qos(1, 0, false)

	msgs, err := channel.Consume(
		queue.Name,
		"WebmDownloader",
		false,
		false,
		false,
		false,
		nil,
	)
	check(err)

	client := &http.Client{}

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			webm := &Webm{}
			objId := bson.ObjectId(msg.Body)
			webmCollection.FindId(objId).One(&webm)

			req, err := http.NewRequest("GET", "http://2ch.hk/" + strings.TrimLeft(webm.Url, "/"), nil)
			check(err)

			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36")
			req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
			req.Header.Set("Accept-Language", "ru,en-US;q=0.8,en;q=0.6")
			req.Header.Set("Cache-Control", "no-cache")
			req.Header.Set("Referer", "http://2ch.hk/b/")
			resp, err := client.Do(req)
			check(err)

			bytes, _ := ioutil.ReadAll(resp.Body)

			hasher := adler32.New()
			hasher.Write(bytes)
			checksum := hasher.Sum32()

			sameWebm := &Webm{}
			err = webmCollection.Find(bson.M{"file_info.size": len(bytes), "file_info.checksum": checksum}).One(sameWebm)
			if err != nil {
				fmt.Println(len(bytes), checksum)

				directoryPath := path.Join("G:/webms", strconv.Itoa(webm.ThreadId))
				os.MkdirAll(directoryPath, 0644)
				filePath := path.Join(directoryPath, objId.Hex()+".webm")

				err = ioutil.WriteFile(filePath, bytes, 0644)
				check(err)

				err = webmCollection.UpdateId(objId, bson.M{"$set": bson.M{"file_info.size": len(bytes), "file_info.checksum": checksum, "file_info.path": filePath}})
				check(err)
			} else {
				fmt.Println(err)
				fmt.Println(webm)
				fmt.Println(sameWebm)
				fmt.Println("Found same file!")
			}

			resp.Body.Close()

			sleepTime := rand.Int63n(15)
			time.Sleep(time.Duration(sleepTime) * time.Second)

			msg.Ack(false)
		}
	}()

	<-forever
}
