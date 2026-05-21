Integrate spec generation results into the editor so users can view, preview, and download specs from the existing AI sidebar specs tab 

### implementation

1 spec list

- in the right sidebar(specs tab) show a list of specs for the current project
- fetch specs from the backend using the existing projectspec AI
- display:
createdAt
filename
-keep items simple and clickable

2 preview model 
- open a modal when a spec is selected
- Fetch this byte content to an existing endpoint. Do not access the blob directly from the client 
- Render Content as Markdown 
- Include a close action and basic keyboard support. 

3 download action

- Add a download action for each spec plus model.
- Call the download endpoint.
- Let the browser handle the file download.\

## Ui details

- Use existing cipher to build your own free design. 
- use shadcn/ui components (dialog, ScrollArea, Button)
- use existing colors and tokens from globals.css
- keep the list compact and scrollable


### scope limits

- Do not implement backend logic.
- Do not fetch blob URLs.
- Guarantee to the client.
- Do not store spec content in frontend state long term.
- Do not redesign the site, workboard, or tabs.
- Do not add Global States.

### notes

- reuse existing fetch patterns used in the app
- assume projectspec only provides metadata, content must be fetched separately

### check when done

- spect list loads for the current project
- modal shows rendered markdown content
- download action triggers file download
- no typescript errors and build passes