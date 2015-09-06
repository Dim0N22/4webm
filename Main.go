package main


import (
//	"os"
//	"io"
//	"net/http"
//	"io/ioutil"
//	"encoding/json"
	"fmt"
//	"strings"
    "golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
	"os"
	"io/ioutil"
	"encoding/json"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

type Thread struct {
	Num string `json:"num"`
	Score float32 `json:"score"`
	Subject string `json:"subject"`
	Timestamp int `json:"timestamp"`
	View int `json:"views"`
}

type TopThreads struct {
	Board string `json:"board"`
	Threads []Thread `json:"threads"`
}

func exampleReadGBK(filename string) (string) {
	// Read UTF-8 from a GBK encoded file.
	f, err := os.Open(filename)
	check(err)

	r := transform.NewReader(f, charmap.Windows1251.NewDecoder())
	buf, err := ioutil.ReadAll(r)
	check(err)

	s := string(buf) // строка в UTF-8

	return s
}

var jsonThreads = "{\"board\":\"b\",\"threads\":[{\"num\":\"101234607\",\"score\":895.403716486,\"subject\":\"WEBM -тред  предыдущий >>101225115 (OP) \",\"timestamp\":1441223903,\"views\":6470},{\"num\":\"101235410\",\"score\":15.5024294708,\"subject\":\"НОВЫЙ ПОЛОЖНЯК Лyчшие девушки - усские. Действительно, некрасивых много, но те что красивы и няшны просто бесподобны...\",\"timestamp\":1441224399,\"views\":113},{\"num\":\"101235652\",\"score\":79.8345356723,\"subject\":\"Платиновый, твой, сакральный.\",\"timestamp\":1441224569,\"views\":279}]}"

func main() {
//	out, err := os.Create("output.json")
//	check(err)
//	defer out.Close()
//	resp, err := http.Get("https://2ch.hk/b/threads.json")
//	check(err)
//	defer resp.Body.Close()
//	_, err = io.Copy(out, resp.Body)
//	check(err)

//	exampleReadGBK("output.json")
//	check(err)
//	out, err := os.Open("output.json")
//	check(err)
//	transform.NewReader(out, enc.NewDecoder())
//	s := exampleReadGBK("output.json")
//	fmt.Print(s)
//	fmt.Printf("%s", rInUTF8))
	var threads TopThreads
	err := json.Unmarshal([]byte(jsonThreads), &threads)
	check(err)
	fmt.Print(threads)
}
