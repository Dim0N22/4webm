package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"encoding/json"
	"gopkg.in/mgo.v2/bson"
	"strconv"
	"time"
)

type thread struct {
	Num       string  `json:"num"`
	Score     float32 `json:"score"`
	Subject   string  `json:"subject"`
	Timestamp int     `json:"timestamp"`
	Views     int     `json:"views"`
	Board     string  `json:"Board"`
	Threads   []struct {
		Posts []struct {
			Comment   string `json:"comment"`
			Timestamp int64  `json:"timestamp"`
			Files     []struct {
				Md5  string `json:"md5"`
				Name string `json:"name"`
				Path string `json:"path"`
				Type int32  `json:"type"`
			} `json:"files"`
		} `json:"posts"`
	} `json:"threads" `
}

type byViews []thread

func (slice byViews) Len() int {
	return len(slice)
}

func (slice byViews) Less(i, j int) bool {
	return slice[i].Views > slice[j].Views
}

func (slice byViews) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}

func (th thread) GetWebmLinks() {
	link := "https://2ch.hk/b/res/" + th.Num + ".json"
	resp, err := http.Get(link)
	check(err)
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	check(err)

	dat := thread{}
	err = json.Unmarshal(body, &dat)
	if err != nil {
		return
	}

	totalFiles := 0
	newFiles := 0
	for _, thread := range dat.Threads {
		for _, post := range thread.Posts {
			for _, file := range post.Files {
				if file.Type == 6 {
					totalFiles += 1
					threadId, _ := strconv.Atoi(th.Num)
					webm := Webm{
						Id:         bson.NewObjectId(),
						Url:        "/" + dat.Board + "/" + file.Path,
						ThreadId:   threadId,
						Board:      dat.Board,
						CreateDate: time.Now(),
						Md5:        file.Md5,
					}
					if webm.saveWebm() {
						newFiles += 1
					}
				}
			}
		}
	}
	fmt.Println("Всего вебмок в треде: " + strconv.Itoa(totalFiles))
	fmt.Println("Из них новых: " + strconv.Itoa(newFiles))

	time.Sleep(5 * time.Second)
}
