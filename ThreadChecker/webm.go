package main

import (
	"strconv"
	"time"

	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2/bson"
)

type Webm struct {
	Id         bson.ObjectId `json:"id" bson:"_id"`
	ThreadId   int           `json:"thread_id" bson:"thread_id"`
	Board      string        `json:"board" bson:"board"`
	Url        string        `json:"url" bson:"url"`
	CreateDate time.Time     `json:"create_date" bson:"create_date"`
	Md5        string        `json:"md5" bson:"md5"`
}

func newWebm(match []string) *Webm {
	url := match[1]
	board := match[2]
	threadId, err := strconv.Atoi(match[3])
	check(err)

	webm := Webm{Id: bson.NewObjectId(), Url: url, Board: board, ThreadId: threadId, CreateDate: time.Now()}
	return &webm
}

// saveWebm saves webm url to mongo
func (webm Webm) saveWebm() bool {
	err := webmCollection.Find(bson.M{
		"$or": []interface{}{
			bson.M{"url": webm.Url},
			bson.M{"md5": webm.Md5},
		},
	}).One(&Webm{})

	if err != nil {
		err := webmCollection.Insert(webm)
		check(err)

		err = channel.Publish(
			"",
			queue.Name,
			false,
			false,
			amqp.Publishing{
				DeliveryMode: amqp.Persistent,
				ContentType:  "text/plain",
				Body:         []byte(webm.Id),
			})
		check(err)

		return true
	}
	return false
}
