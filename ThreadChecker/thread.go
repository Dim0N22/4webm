package main

import (
	"encoding/json"
	"fmt"
	"gopkg.in/mgo.v2/bson"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

type thread struct {
	Num     string `json:"thread_num"`
	Board   string `json:"Board"`
	Threads []struct {
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

func (th thread) GetWebmLinks(req http.Request, client http.Client) {
	link := "https://2ch.hk/b/res/" + th.Num + ".json"
	req.URL, _ = url.Parse(link)
	resp, err := client.Do(&req)
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
