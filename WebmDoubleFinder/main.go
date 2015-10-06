package main

import (
	"fmt"
	"github.com/Dim0N22/go-phash"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"log"
	"net/http"
	_ "net/http/pprof"
	"strconv"
	"strings"
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

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
	go func() {
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	mongoSession, err := mgo.Dial("mongodb://192.168.1.47")
	check(err)
	defer mongoSession.Close()
	webmCollection := mongoSession.DB("4webm").C("webms")
	webms := webmCollection.Find(bson.M{
		"$and": []interface{}{
			bson.M{"seqid": bson.M{"$exists": true}},
			bson.M{"hasharr": bson.M{"$exists": false}},
		},
	}).Iter()

	var path string
	var hash []uint64
	var webm Webm
	for webms.Next(&webm) {
		path = strings.Replace(webm.FileInfo.Path, "G:/webms/", "/mnt/hgfs/webms/", -1)
		hash, err = phash.VideoHashDCT(path)

		var shash []string
		for _, h := range hash {
			shash = append(shash, strconv.FormatUint(h, 10))
		}

		if err != nil {
			fmt.Println(err)
		}

		err = webmCollection.UpdateId(webm.Id, bson.M{"$set": bson.M{"hasharr": shash}})
		fmt.Println(err)
	}
}
