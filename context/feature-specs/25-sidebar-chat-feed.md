Add real-time Zoom chat to the AI sidebar using a separate LiveBlocks AI-chat feed 

This is only for chat messages. Keep it separate from the AI status feed, which handles AI progress and presence updates 

## implementation

1 add the ai-chat feed
 Before implementing, check the existing live block setup and follow the same three-pattern already used. 
- Create or reuse a live blog feed named ai-chat
- Keep it room scoped. 
- Do not mix it with AI-status-feed. 

2 wire the chat feed into the sidebar

- Subscribe to AI - chat in the side chart area. 
- Render chat messages in order. 
- Show sender timestamp and message content. 
- Keep the styling consistent with the existing sidebar UI. 
- Use Tailwind utilities and existing shadcn components where they are fit. 

3 add message sending
- Allow users in the room to send messages to the AI-chat
- use the existing sidebar input and send button
- clear the input agter a successful send
- show a small error state if sending fails

4 add message validation
- define or resuse a zod schema in types/tasks.ts
- messge shape should include sender, role, content and timestamp

## scope limits

- Don't add AI-generated replies yet.
- Don't trigger background AI tasks.
- Don't mix chat messages with status messages.
- Don't create a parallel real-time system outside live blogs.
- Keep this focused on collaborative sidebar chat only

## check when done

- sidebar subscribes to the ai-chat feed
- users can send chat messages through the existing sidebar input
- chat messages are validated before rendering
- ai-chat remains  separate from ai-status-feed
- npm run builds
