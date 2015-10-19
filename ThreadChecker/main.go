package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"net/http"

	"4webm/cloudflare-bypasser"
	"fmt"
	"github.com/streadway/amqp"
	"gopkg.in/mgo.v2"
	"net/url"
	"strconv"
	"time"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

var (
	ERROR_CODE     = flag.Int("e", 503, "Cloudflare error code")
	MongodbUrl     = flag.String("m", "mongodb://127.0.0.1", "MongoDb url")
	RabbitMqUrl    = flag.String("p", "amqp://linux:123@127.0.0.1:5672/", "RabbitMQ url and port")
	ProxyUrl       = flag.String("x", "http://127.0.0.1:8888", "Proxy url")
	webmCollection *mgo.Collection
	channel        *amqp.Channel
	queue          amqp.Queue
)

func main() {
	flag.Parse()

	mongoSession, err := mgo.Dial(*MongodbUrl)
	check(err)
	defer mongoSession.Close()
	webmCollection = mongoSession.DB("4webm").C("webms")

	amqpConnection, err := amqp.Dial(*RabbitMqUrl)
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

	proxyUrl, err := url.Parse(*ProxyUrl)
	check(err)
	client := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyUrl)}}
	req, err := http.NewRequest("GET", "", nil)
	check(err)

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "ru,en-US;q=0.8,en;q=0.6")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Referer", "http://2ch.hk/b/")

	pages := []string{"index", "1", "2", "3", "4", "5"}
	var resultPages []topThreads
	for i, page := range pages {
		fmt.Println("Парсим страницу №: " + strconv.Itoa(i))

		req.URL, err = url.Parse("http://2ch.hk/b/" + page + ".json")
		check(err)
		resp, err := client.Do(req)

		if resp.StatusCode == *ERROR_CODE {
			cookie, err := cloudflarebypasser.GetCloudflareClearanceCookie(req.URL, proxyUrl)
			check(err)

			fmt.Println(cookie)

			req.AddCookie(cookie)
			resp, err = client.Do(req)
			check(err)
		}

		body, err := ioutil.ReadAll(resp.Body)
		check(err)
		defer resp.Body.Close()

		var threads topThreads
		err = json.Unmarshal(body, &threads)
		check(err)

		fmt.Println("Получили " + strconv.Itoa(len(threads.Threads)) + " тредов")

		resultPages = append(resultPages, threads)
		time.Sleep(1 * time.Second)
	}

	for i, page := range resultPages {
		for j, thread := range page.Threads {
			fmt.Println("Парсим тред №: " + strconv.Itoa(j) + " со страницы №: " + strconv.Itoa(i))
			thread.GetWebmLinks(*req, *client)
		}
	}
}
