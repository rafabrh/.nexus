FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /engine ./cmd/engine

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=builder /engine /engine
EXPOSE 8081 9090 50051
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://127.0.0.1:8081/healthz || exit 1
ENTRYPOINT ["/engine"]
