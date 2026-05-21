Setup the backend flow for design generation using trigger.dev
This unit handles triggering background drops, tracking runs, and issuing tokens. No AI logic yet. 

## implementation

1 add the design tigger route

create POST /api/design
This route should:
- accept the design prompt and required context (`roomId`, `projectId`) 
- trigger the design task through trigger.dev
- create a task run record, and return the run ID to the client. 

2 add task run tracking

create a taskrun model in prisma to track trigger.dev runs verify ownership

it should include:
- runId (unique)
- projectId
- userId
- createAt

add:
- an index on runId
- a compound index on userId and projectId

3 add the token route

create POST /api/ai/design/token
this route should:
- accept a run ID
- Verify ownership using the task run record. 
- Generate a trigger.dev public token scoped to that run. 
- Return the token to the client. 

4 create the design task 

create trigger/design-agent.ts

- Check the existing trigger.dev setup and installed agent features first. 
- We will use the existing setup instead of creating a new pattern. 
- Export and Minimal Design Task 
- accept the expected payload(`prompt`, `roomId`)
- log or echo the input for now
- don't add AI logic yet

## Scope limits
- Don't generate nodes or hsget.
- Don't call any AI providers.
- Don't update the canvas.
- Keep this focus on backend task wiring only.

## check when done

- POST /api/ai/design triggers a background task
- Task runs are stored in Prisma. 
- POST /api/ai/design/token returns a run scoped token
- Design task exists and is callable. 
- npm run build passes