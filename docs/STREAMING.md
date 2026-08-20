# Streaming replies

MedClaw consumes Claude Agent SDK partial `text_delta` events and keeps the
SDK's terminal `result` as the canonical answer. This mirrors the production
pattern used by the MySkin chat: progressively display buffered model output,
then flush and settle it on success, failure, or cancellation.

## Channel behavior

| Channel     | Behavior                                                 | Extra setup                                     |
| ----------- | -------------------------------------------------------- | ----------------------------------------------- |
| Feishu/Lark | One native CardKit markdown card with typewriter updates | The app must have CardKit/message permissions   |
| DingTalk    | One native streaming AI card                             | Import an AI-card template and configure its ID |
| QQ          | One final message                                        | None; no verified edit/stream API is used       |

If native stream creation fails before a card is visible, MedClaw logs the
failure and sends the final answer through the channel's normal message API.

## DingTalk setup

1. In DingTalk's card builder, import the official “typewriter streaming AI
   card” example or create an equivalent AI card.
2. Confirm that the streaming Markdown variable is named `content`, or choose
   another name.
3. Copy the template ID belonging to your own DingTalk application into `.env`:

```dotenv
DINGTALK_AI_CARD_TEMPLATE_ID=your-template-id.schema
DINGTALK_AI_CARD_CONTENT_KEY=content
```

Do not rely on the public test template ID from DingTalk's example repository
for production. The template must belong to the application whose client ID
and secret MedClaw uses.

## Delivery rules

- Only visible `text_delta` events are forwarded. Thinking/tool JSON deltas are
  ignored.
- `<internal>...</internal>` content is filtered even when tags are split
  across chunks.
- Platform updates are serialized and throttled instead of issuing one API
  request per token.
- The terminal result replaces the accumulated draft, preventing intermediate
  tool chatter from becoming the final answer.
- Failure and provider termination both finalize any card already shown.
