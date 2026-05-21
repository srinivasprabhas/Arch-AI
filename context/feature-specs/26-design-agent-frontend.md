Wire up the AI sidebar so users can submit design prompts, track their run status in real-time, and reflect AI-driven camera updates to live blocks

## implementation

1 submit from AI sidebar

- on submit:
Push the user message to be AI-Chat feed
call POST /api/ai/design with {prompt, roomId}
read {runID, publicTokem} from response
- store runId and publicTokem in local state

2 run status tracking

- use useRealtimeRun(runId, {accessToken, publicToken})
- while the run is active:
disable the chat input
show a loading state( spinner in the button)
- when the run completes
push a final AI message too ai-chat
reset loading + run state

3 canvas updates (realtime)

- Do not manually update nodes or edges 
- rely on liveblocks (useLiveblocksFlow) to reflect changes in real time
- Ai updates to nodes edges and presence should appear automatically

4 status display

- read the latest message from ai-status-feed
- show a compact status strip above the input only when a run is active

### UI details

- use existing design tokens from globals.css (do not introduce new colors)
- follow ui-context.md for layout and visual consistency

chat bubbles 

- user: green accent background(#62C073) readable contrast text
- AI: dark background, light text

submit button 

- enabled: green accent(#62C073)
- disabled: dimmed state
- while running: show spinner

status strip

- compact bar above input
- dark base + green accent
- subtle animated indicator is fine

general 

- use tailwind + shadcn/ui only
- keep current layout intact
- show errors as messages in ai-chat feed

### scope limits

- Do not implement backend or trigger.dev logic.
- Do not fetch final graph data.
- Do not redesign the sidebar.
- Do not hardcode a new theme outside existing tokens.
- Do not manually sync canvas state.

## notes

- Follow live blogs best practices for feeds (ai-chat, ai-status-feed)
- keep everything collaborative: all updates should be visible across clients. 

### check when done

- submitting a prompt calls /api/ai/design and returns a runId
- useRealtimeRun connects using the returned token 
- Input is disabled while the run is active. 
- Status strip appears only during active runs. 
- Chat updates appear across multiple sessions. 
- No typescript or build errors 
