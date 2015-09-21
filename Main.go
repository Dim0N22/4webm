package main

import (
	"io/ioutil"
	"net/http"
	"encoding/json"
	"sort"
	"flag"

	//"4webm/cloudflare-bypasser"
	//"net/url"
	"gopkg.in/mgo.v2"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

var (
	MIN_VIEWS = flag.Int("w", 1000, "Minimum views to parse thread")
	ERROR_CODE = flag.Int("e", 503, "Cloudflare error code")
	webmCollection * mgo.Collection
)

func main() {
	flag.Parse()

	s, err := mgo.Dial("mongodb://localhost")
	check(err)
	defer s.Close()
	webmCollection = s.DB("4webm").C("webms")

	//url, _ := url.Parse("http://2ch.hk/b/threads.json")

	//cloudflarebypasser.GetCloudflareClearanceCookie(url)

//	panic("Cloudflare protection!")
	client := &http.Client{}
	
	req, err := http.NewRequest("GET", "http://2ch.hk/b/threads.json", nil)
	check(err)
	
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "ru,en-US;q=0.8,en;q=0.6")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Referer", "http://2ch.hk/b/threads.json")
    resp, err := client.Do(req)
	
	body, err := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()

	if resp.StatusCode == *ERROR_CODE {
		//fmt.Println(string(body))
		parseForm()
		panic("Cloudflare protection!")
	}

	var threads topThreads
	err = json.Unmarshal(body, &threads)
	check(err)
	sort.Sort(byViews(threads.Threads))

	for _, thread := range threads.Threads {
		if thread.Views > *MIN_VIEWS {
			thread.GetWebmLinks()
		}
	}
}

func parseForm() {

}