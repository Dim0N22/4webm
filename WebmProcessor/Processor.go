package main

import (
	"gopkg.in/mgo.v2"
	"fmt"
	"gopkg.in/mgo.v2/bson"
	"time"
	"os/exec"
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


func check(e error) {
	if e != nil {
		fmt.Println(e)
		panic(e)
	}
}

func main() {
	mongoSession, err := mgo.Dial("mongodb://localhost")
	check(err)
	defer mongoSession.Close()
	webmCollection := mongoSession.DB("4webm").C("webms")

	webms := &[]Webm{}
	webmCollection.Find(nil).All(webms)
	check(err)
	for _, webm := range *webms {
		if webm.FileInfo.Path != "" {
			fmt.Println("processing: " + webm.FileInfo.Path)
			err := exec.Command("D://PROJECTS/Go/src/4webm/ffmpeg.exe", "-i", webm.FileInfo.Path, "-deinterlace", "-vframes", "1", "-vf", "scale='if(gte(iw,ih),300,-1)':'if(gt(ih,iw),300,-1)'", "-y", webm.FileInfo.Path + ".300x300.jpg").Run()
			check(err)
			fmt.Println("End processing: " + webm.FileInfo.Path)
		}
	}
}
