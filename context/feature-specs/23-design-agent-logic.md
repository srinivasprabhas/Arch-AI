Increment the full AI design agent so a music form results in real-time updates on the collaborator canvas with visible AI presence and status 

## implementation

1 update the design agent task in trigger/design-agent.ts

before implementing:
- check context/project-overview.md and context/architecture.md for product behavior and system rules
	- Before implementing, check Liveblocks and Trigger.dev agent skills for current patterns on canvas mutation and background task execution. 
- follow the existing trigger.dev setup and agent patterns already in the project
- We use existing live blocks flow and presence patterns instead of creating new ones. 

then implement:
- use gemini (`@ai-sdk/google`) to interpret the user prompt
- Update the canvas using the existing collaborative flow utilities. 
- Support actions like:
- Add Node
- Move Node
- Resize Node
- Update Node Data
- Delete Node
- Delete Edge

- Publish AI activity to the shared status screen so all users can see progress. 
- Update AI presence, cursor plus thinking state while the task runs. 
- Push Clear Status Messages at 3 steps. Start Processing Complete. 

- Ensure generated design follows allowed node shapes, color palette, layout and typing rules. 

- Handle errors gracefully and update status if something fails. 
- Clear AI presence when the task finishes. 

## dependencies

All packages are already installed. Gemini API key is already in env.local. 


## scope limits
- Don't change canvas architecture.
- Don't introduce a new state system outside of life blocks.
- Don't bypass existing collaborative flow utilities.

## check when done
- The design task updates the canvas through the existing collaborative flow. 
- AI presence and status are visible to all participants. 
- Status messages reflect task progress. 
- Errors are handled without breaking canvas. 
- npm run  build passes