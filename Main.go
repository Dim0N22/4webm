package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"encoding/json"
	"sort"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
	resp, err := http.Get("https://2ch.hk/b/threads.json")
	check(err)
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)

	var threads topThreads
	err = json.Unmarshal(body, &threads)
	check(err)
	sort.Sort(byViews(threads.Threads))
	fmt.Println(threads.Threads)
}
