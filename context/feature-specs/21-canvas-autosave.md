Add autosave and loading for the Collaborative canvas so project status is persisted. The canvas JSON should be stored in Vercel blob and the saved blob URL should be stored on the Prisma project record 

## what to install

- @vercel/blob

## Implementation

1 check when existing project schema

- review prisma/model/project.prisma
- Add or reuse a field for the canvas blob URL
- Keep Prisma responsible for metadata only. 

2 add canvas, save or load API routes. 
create: PUT /api/projects/[projectID]/canvas
This root should:
- Receive latest canvas JSON
- Upload the JSON to Vercel blob
- Store the returned blob URL on the matching Prisma project record

create: GET /api/projects/[projectID]/canvas
This route should:
- read the project's saved blob URL from prisoner
- text the shared canvas station from Vercel: blob
- return the canvas state to the editor

3 add an autosave hook in this /hook folder. 
- watch the canvas nodes and edges
- DeBounce saves to avoid excessive writes
- Save through the canvas API route
- track save status: saving, saved, error

4 load saved canvas state in the editor 
- When the editor loads, check if the live block's room has any existing nodes or edges. 
- If the room is empty and the project has a saved canvas blob URL, fetch and load saved canvas state. 
- If the room already has nodes or edges, skip the load entirely to avoid overwriting active collaboration. 
 5 add a small save status indicator in the editor save button. 
- Show saving saved or error states. 

## storage pattern

- Prisma stores project metadata and canvas block URL
- Vercel Blob stores the actual canvas JSON. 

## check when done
- @vercel/blob is installed
- Project schema supports storing the canvas blog URL. 
- Save/load routes Use prisma for metadata and vercel blob for canvas design. 
- - Auto save hook debounces canvas saves
- Editor shows save status. 
- Same canvas does not load if the room already has active nodes or edges. 
- Npm run build passes