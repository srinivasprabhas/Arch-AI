Complete the existing AI sidebar placeholder and turn it into a proper floating chat sidebar component. The sidebar already exists so keep the current floating placement and smooth slide-in behavior from the right side. This unit is focused on building out the sidebar UI inside it. 

## Implementation

1 separate the AI sidebar into its own component. 
- Make the AI sidebar a floating component.
- Keep the Open/Close state controlled by the Parent. 
- Preserve the existing side animation, floating position, border, background, and shadow styling. 
- Use sidebar surface styles like BG-Base/95, border surface border, and the current shadow treatment. 

2 add the sidebar header 
- Title AI workspace
- Subtitle Collaborate with ARC AI
- Small bot icon
- Close button aligned to the right
- Use text for the title
- Use text muted text for the subtitle 

3 add a tabbed layout with two tabs

use shadcn tabs 
- AI architect
- specs
- Active tab should use the accent styling like bg accent and text accent. 
- Inactive tab text should stay muted with text muted text. 

4 building AI Arrchitect tab
Use shadcn components where they fit especially button and text area. 
- Scrollable Chart Area 
- Empty state with bot icon, short description, and starter from chips 
- starter chip:
	- Design an e-commerce backend.
	- Create a chat app architecture.
	- Build a CI/CD pipeline.
- Style starter clips as soft pills using bg-subtle and text-accent text. 
- User messages should be right aligned with bg-brand dim border-brand/50 border-2 text-copy-primary. 
- Assistant messages should be left aligned with bg-elevated border border-surface-border text-accent-text
- Input area width and auto-resizing text area around 72px min height and 160px max height 
- Send button should use BG accent text white. 
- Enter submits. Shift Enter adds a new line. 

5 build the specs tab
- Show a "Generate Spec" button using BGX in TextWrite. 
- Show a demo spec card for now. 
- Style the card with BG Elevated and Border Surface border. 
- Include a file or spec icon, title, short snippet, and disabled download action. 

6 use the existing project color tokens

check globals.css , ui-context.md or the tailwind before adding direct values avoid inventing new colors of a matching token already exists

## scope limits

- Don't rebuild your existing sidebar, open or closed.
- Don't add backend logic.
- Don't add LiveBlocks or AI Generation Logic edge.
- Keep this focused on the sidebar UI structure.

## check when done

- AI sidebar is separated into its own component.
- Existing floating slide in behavior is preserved. 
- Sidebar includes AI Architect and Spec Style. 
- AI architect tab has empty state, starter chips, and input UI
- Specs tab has a generate button and a static demo spec card. 
- npm run build passes