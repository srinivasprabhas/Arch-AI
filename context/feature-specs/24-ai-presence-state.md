Add shared UI activity indicators so everyone in the room can see when generation is in progress. The unit is only for UI presence and real-time checker signals. Do not add the actual AI generation flow yet 

## implementation

1 we can add AI to each state to the side bar
- Show a small status indicator when AI is working. 
- Make the status visible to everyone in the room. 
- This will be charged as input while generation is active. 
- Show a loading state on the send button.
- Keep the rest of the sidebar usable. 

2 add a shared AI Status feed
- Check the existing light block setup and installed agent-related features first. 
- Follow life blocks best practices for peace or presence instead of creating parallel real-time state. 
- Create or reuse a lightbox named ai-status-feed
- Subscribe to the latest feed. Message in the sidebar 
- Show only the most recent status messages. 
- Keep the feed generic enough for design and spec generation later. 

3 add status message validation

- Define the feed payload schema in types/tasks.ts
- The payload should support an optional text field
- Validate incoming messages before displaying them. 

4 add thinking indicators to live cursors
- When a participant has thinking: true in presence show a small spinner in their cursor name badge. 
- Hide the spinner when thinking is false or missing. 

## scope limts

- Don't add actual AI generation logic.
- Don't trigger background tasks yet.
- Don't block or dim the whole sidebar.
- Don't show full feed history.
- Keep this focused on shared AI activity only

## check when done

- sidebar can render shared AI status from ai-status-feed
- chat input and send button respond to active generation state
- cursor badges read thinking from presence
- feed messages are validated through the task scheme
- npm run build passes
