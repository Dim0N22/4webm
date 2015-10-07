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
	"time"
)

type FileInfo struct {
	Size     int    `json:"size" bson:"size"`
	Checksum int    `json:"checksum" bson:"checksum"`
	Path     string `json:"path" bson:"path"`
}

type Webm struct {
	Id           bson.ObjectId `json:"id" bson:"_id"`
	ThreadId     int           `json:"thread_id" bson:"thread_id"`
	Board        string        `json:"board" bson:"board"`
	Url          string        `json:"url" bson:"url"`
	CreateDate   time.Time     `json:"create_date" bson:"create_date"`
	FileInfo     FileInfo      `json:"file_info" bson:"file_info"`
	HashesString []string      `json:"hasharr" bson:"hasharr"`
	HashesUint64 []uint64
}

type Result struct {
	Webm    Webm
	Doubles []Webm
}

type MaxWebmId struct {
	Id        bson.ObjectId `json:"id" bson:"_id"`
	CurrentId int           `json:"currentId" bson:"currentId"`
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
	seqIdCollection := mongoSession.DB("4webm").C("maxwebmid")
	var webms []Webm
	webmCollection.Find(bson.M{"$and": []interface{}{
		bson.M{"seqid": bson.M{"$exists": false}},
		bson.M{"doubles": bson.M{"$exists": false}},
		bson.M{"hasharr.0": bson.M{"$exists": true}},
	}}).All(&webms)

	// Convert slice of strings to slice of uint64
	for i, webm := range webms {
		uintHash := []uint64{}
		for _, hash := range webm.HashesString {
			parsedUint64, err := strconv.ParseUint(hash, 10, 64)
			check(err)
			uintHash = append(uintHash, parsedUint64)
			if len(uintHash) == 1000 {
				break
			}
		}
		webms[i].HashesUint64 = uintHash
	}

	// max concurrent 4 goroutines
	ch := make(chan bool, 4)

	// find doubles in all webms
	for i, webm := range webms {
		ch <- true

		go func(webm Webm, i int) {
			doubles := []bson.ObjectId{}

			// compare webm with all subsequent webms
			for _, dWebm := range webms[i+1:] {
				distance, err := phash.HammingDistanceForVideoHashes(webm.HashesUint64, dWebm.HashesUint64, 10)
				check(err)
				if distance > 0.999 {
					doubles = append(doubles, dWebm.Id)
				}
			}

			// if there are no doubles, set seqId, else write doubles to DB
			if len(doubles) == 0 {
				change := mgo.Change{
					Update:    bson.M{"$inc": bson.M{"currentId": 1}},
					ReturnNew: true,
				}

				id := MaxWebmId{}
				_, err = seqIdCollection.Find(nil).Apply(change, &id)
				check(err)

				err = webmCollection.UpdateId(webm.Id, bson.M{"$set": bson.M{"seqid": id.CurrentId}})
				check(err)
			} else {
				err = webmCollection.UpdateId(webm.Id, bson.M{"$set": bson.M{"doubles": doubles}})
				check(err)
			}

			fmt.Println(webm.Id, len(doubles))
			<-ch
		}(webm, i)
	}

	for i := 0; i < cap(ch); i++ {
		ch <- true
	}
}
