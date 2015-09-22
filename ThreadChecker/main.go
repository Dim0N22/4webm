package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"net/http"
	"sort"

	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

var (
	MIN_VIEWS      = flag.Int("w", 1000, "Minimum views to parse thread")
	ERROR_CODE     = flag.Int("e", 503, "Cloudflare error code")
	webmCollection *mgo.Collection
	channel        *amqp.Channel
	queue          amqp.Queue
)

func main() {
	flag.Parse()

	mongoSession, err := mgo.Dial("mongodb://localhost")
	check(err)
	defer mongoSession.Close()
	webmCollection = mongoSession.DB("4webm").C("webms")

	amqpConnection, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	check(err)
	defer amqpConnection.Close()

	channel, err = amqpConnection.Channel()
	check(err)
	defer channel.Close()

	queue, err = channel.QueueDeclare(
		"webmDownload",
		true,
		false,
		false,
		false,
		nil,
	)
	check(err)

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
		//cloudflarebypasser.GetCloudflareClearanceCookie(url)
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
