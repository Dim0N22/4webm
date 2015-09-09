package main

type thread struct {
	Num string `json:"num"`
	Score float32 `json:"score"`
	Subject string `json:"subject"`
	Timestamp int `json:"timestamp"`
	View int `json:"views"`
}

type byViews []thread

func (slice byViews) Len() int {
	return len(slice)
}

func (slice byViews) Less(i, j int) bool {
	return slice[i].View > slice[j].View;
}

func (slice byViews) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}