package normalize

import "encoding/json"

type NexusEventV1 struct {
	Event     string `json:"event"`
	Instance  string `json:"instance"`
	MessageID string `json:"messageId"`
	RemoteJid string `json:"remoteJid"`
	PushName  string `json:"pushName"`
	Body      string `json:"body"`
	Timestamp int64  `json:"timestamp"`
	IsGroup   bool   `json:"isGroup"`
	MediaType string `json:"mediaType,omitempty"`
	MediaURL  string `json:"mediaUrl,omitempty"`
}

type Normalizer struct{}

func New() *Normalizer { return &Normalizer{} }

func (n *Normalizer) Normalize(raw []byte) (*NexusEventV1, error) {
	var event NexusEventV1
	if err := json.Unmarshal(raw, &event); err != nil {
		return nil, err
	}
	event.RemoteJid = resolveCanonicalJid(event.RemoteJid)
	return &event, nil
}

func resolveCanonicalJid(jid string) string {
	// Normalize @lid to @s.whatsapp.net
	return jid
}
