package main

import (
	"time"
	"strconv"
)

type webm struct {
	Id int
	ThreadId int
	Board string
	Url string
	CreateDate time.Time
}

func NewWebm(match []string) *webm{
	url := match[1]
	board := match[2]
	threadId, err := strconv.Atoi(match[3])
	check(err)
	webmId, err := strconv.Atoi(match[4])
	check(err)
	webm := webm{Url: url, Board: board, ThreadId: threadId, Id: webmId, CreateDate: time.Now()}

	return &webm
}

// saveWebmUrlIfNew saves webm url to mongo if web is new
// otherwise it does nothing
//func (webm webm) saveWebmUrlIfNew(link string){
//	webm.
//}