package main

type topThreads struct {
	Board string `json:"board"`
	Threads []thread `json:"threads"`
}
