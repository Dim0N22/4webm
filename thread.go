package main

import (
	"fmt"
	"net/http"
	"io/ioutil"
	"regexp"
)

type thread struct {
	Num string `json:"num"`
	Score float32 `json:"score"`
	Subject string `json:"subject"`
	Timestamp int `json:"timestamp"`
	Views int `json:"views"`
}

type byViews []thread

func (slice byViews) Len() int {
	return len(slice)
}

func (slice byViews) Less(i, j int) bool {
	return slice[i].Views > slice[j].Views;
}

func (slice byViews) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}

func (thread thread) GetWebmLinks(){
//	go (func() {
		re := regexp.MustCompile("href=\"(\\/(\\w+)\\/\\w+\\/(\\d+)\\/(\\d+).webm)\"")
		link := "https://2ch.hk/b/res/" + thread.Num + ".html"
		resp, err := http.Get(link)
		check(err)
		defer resp.Body.Close()
		body, err := ioutil.ReadAll(resp.Body)
		webmUrls := re.FindAllStringSubmatch(string(body), -1)

		for _, match := range webmUrls {
			webm := NewWebm(match)
			fmt.Println(webm)
		}

		fmt.Scanln()
//	})()
}

