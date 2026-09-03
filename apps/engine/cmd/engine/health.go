package main

import (
	"encoding/json"
	"net/http"
)

func startHealthServer(port string, c interface{ IsReady() bool }) {
	mux := http.NewServeMux()

	// Liveness: process is alive
	mux.HandleFunc("/livez", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Readiness: consumer connected and processing
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if c.IsReady() {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
		} else {
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "not_ready"})
		}
	})

	http.ListenAndServe(":"+port, mux)
}
