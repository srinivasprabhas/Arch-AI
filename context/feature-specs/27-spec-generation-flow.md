Create the backend flow for the AI-powered spec generation API route trigger.dev task token route and run ownership tracking 

### implementation

1 spec trigger route

create or update POST /api/ai/spec

it should:
- accept roomId, chatHistory, nodes and edges
- Authenticate the current user. 
- Resolve project access from room ID 
- Trigger the generate-spec task. 
- Save a taskrun record for ownership or access control. 
- Return the trigger.dev run ID. 

do note trust a client-supplied projected

2 spec token route 

create or update POST /api/ai/spec/token

it should:
- accept runId
- authenticate the current user
- verify the TaskRun belongs to the user
- issue a trigger.dev public access token scoped to that run
- set token expiration to 1 hr
- return the token to the client

3 spec generation task

create or update trigger/generate-spec.ts
define a generatespec task that:

- accepts projectId, roomId, chatHistory, nodes and edges
- validates input with zod
- uses gemini through @ai-sdk/google
- generates a markdown technical spec from the ccanvas and chat context
- updates a run metadata/status for realtime tracking
- returns the generated spec content as task output

Follow the existing trigger.dev task patterns in the codebase for retries, logging, and error handling. 

### scope limits
- Do not add internal logic.
- Do not create spec editor UI.
- Do not store the final spec in this unit.
- Do not write access from client provider's private ID.
- Do not create a new AI provider abstraction.
- Do not change existing cameras or chat data models.

### notes

- check context/projects-overview.md and context/architecture-context.md for system alignment before implementing
- Use zod for request or task input validation. 
- Use Prisma for Task Run Persistence. 
- Project access must come from the authenticated user plus room ID. 
- Keep the task output as plain Markdown. 
- We use existing auth, prisma, trigger.dev, and Gemini patterns. 

## check when done

- POST /api/ai/spec validates input and returns a runID
- a taskrun record is created for the authenticated user
- POST /api/ai/spec/token only returns a token for the run owner
- generate-spec runs through trigger.dev and returns markdown output
- typescript and build passes