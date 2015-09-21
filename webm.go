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
	//webmId, err := strconv.Atoi(match[4])
	check(err)
	//webm := webm{Url: url, Board: board, ThreadId: threadId, Id: webmId, CreateDate: time.Now()}
	webm := webm{Url: url, Board: board, ThreadId: threadId, CreateDate: time.Now()}
	return &webm
}

//// saveWebmUrlIfNew saves webm url to mongo if web is new
//// otherwise it does nothing
//func (webm webm) saveWebmIfNew(link string){
//	webm.
//}