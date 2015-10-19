package main

type topThreads struct {
	Board   string   `json:"Board"`
	Threads []thread `json:"threads"`
}
