package cloudflarebypasser

import (
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/robertkrimen/otto"
)

const (
	UserAgent      = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36"
	Connection     = "keep-alive"
	Accept         = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
	AcceptLanguage = "ru,en-US;q=0.8,en;q=0.6"
	AcceptEncoding = "gzip, deflate, sdch"
)

func GetCloudflareClearanceCookie(url *url.URL) (*http.Cookie, error) {
	client := &http.Client{}

	req, err := http.NewRequest("GET", url.String(), nil)
	req.Header.Set("User-Agent", UserAgent)
	req.Header.Set("Connection", Connection)
	req.Header.Set("Accept", Accept)
	req.Header.Set("Accept-Language", AcceptLanguage)
	req.Header.Set("Accept-Encoding", AcceptEncoding)

	resp, err := client.Do(req)

	cookie := resp.Cookies()[0]

	doc, err := goquery.NewDocumentFromResponse(resp)
	if err != nil {
		return nil, err
	}

	action, exists := doc.Find("form#challenge-form").Attr("action")
	if !exists {
		return nil, errors.New("Cannot find CloudFlare form action")
	}

	jschl_vc, exists := doc.Find("input[name=jschl_vc]").Attr("value")
	if !exists {
		return nil, errors.New("Cannot find CloudFlare jschl_vc value")
	}

	pass, exists := doc.Find("input[name=pass]").Attr("value")
	if !exists {
		return nil, errors.New("Cannot find CloudFlare pass value")
	}

	html, _ := doc.Html()
	declaration := regexp.MustCompile("var .+ (.+={.+)")
	calculation := regexp.MustCompile(";(.+);.+.value")
	declarationString := declaration.FindStringSubmatch(html)
	calculationString := calculation.FindStringSubmatch(html)

	if len(declarationString) < 2 || len(calculationString) < 2 {
		return nil, errors.New("Cannot find Cloudflare secret calculation")
	}

	result := "var " + declarationString[1] + calculationString[1]
	vm := otto.New()
	re, err := vm.Run(result)
	if err != nil {
		return nil, err
	}

	jschl_answer, err := re.ToInteger()
	if err != nil {
		return nil, err
	}

	jschl_answer += int64(len(url.Host))

	req.URL.Scheme = url.Scheme
	req.URL.Host = url.Host
	req.URL.Path = action
	req.AddCookie(cookie)
	values := req.URL.Query()
	values.Add("jschl_vc", jschl_vc)
	values.Add("pass", pass)
	values.Add("jschl_answer", strconv.FormatInt(jschl_answer, 10))
	req.URL.RawQuery = values.Encode()

	time.Sleep(5000 * time.Millisecond)

	resp, err = http.DefaultTransport.RoundTrip(req)

	return resp.Cookies()[0], nil
}
