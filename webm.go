package main

import "time"

type webm struct {
	Id int
	ThreadId int
	Board string
	Url string
	CreateDate time.Time
}

// saveWebmUrlIfNew saves webm url to mongo if web is new
// otherwise it does nothing
//func (webm webm) saveWebmUrlIfNew(link string){
//	webm.
//}