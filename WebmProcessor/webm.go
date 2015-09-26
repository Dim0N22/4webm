package main

import (
	"gopkg.in/mgo.v2/bson"
	"time"
)

type FileInfo struct {
	Size     int    `json:"size" bson:"size"`
	Checksum int    `json:"checksum" bson:"checksum"`
	Path     string `json:"path" bson:"path"`
}

type Webm struct {
	Id         bson.ObjectId `json:"id" bson:"_id"`
	ThreadId   int           `json:"thread_id" bson:"thread_id"`
	Board      string        `json:"board" bson:"board"`
	Url        string        `json:"url" bson:"url"`
	CreateDate time.Time     `json:"create_date" bson:"create_date"`
	FileInfo   FileInfo      `json:"file_info" bson:"file_info"`
}
