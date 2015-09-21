package main

import (
	"time"
	"strconv"
//	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type webm struct {
	Id bson.ObjectId `json:"id" bson:"_id"`
	ThreadId int `json:"threadid" bson:"threadid"`
	Board string `json:"board" bson:"board"`
	Url string `json:"url" bson:"url"`
	CreateDate time.Time `json:"createdate" bson:"createdate"`
}

func NewWebm(match []string) *webm{
	url := match[1]
	board := match[2]
	threadId, err := strconv.Atoi(match[3])
	check(err)
	
	webm := webm{Id:bson.NewObjectId(), Url: url, Board: board, ThreadId: threadId, CreateDate: time.Now()}
	return &webm
}

// saveWebm saves webm url to mongo
func (webm webm) saveWebm(){
	err := webmCollection.Insert(webm)
	check(err)
}