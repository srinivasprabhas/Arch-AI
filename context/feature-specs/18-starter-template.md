Add a small starter template library so users can start a canvas from a pre-built diagram instead of building from scratch 

## implementation

1 create `components/editor/starter-templates.ts`

Include a canvas template type, a canvas templates array, with at least three templates such as:
- microservices
- CI/CD pipeline
- event-driven system

Each template should include:
- ID
- name
- description
- nodes
- edges

Use the shared canvas types and existing node color palette. Add a small helper function if needed to keep the template data readable. 

2 create `components/editor/starter-templates-model.tsx`

The model should:
- open a dialog
- show template cards in a scrollable grid
- show the template name and description
- include an import button for each template
- call on import with selected template then close

3 add a simple diagram preview to each template card. 
- Fit the preview to a fixed-size viewport.
- Calculate the preview bounds from the template node position.
- Draw edges as simple lines between node centers.
- Draw nodes using their shape and color data.
- Keep the preview lightweight.
- No React Flow instance needed.

4 wire starter templates into the editor. 
- Add a navbar button to open the starter templates modal. 
- When a template is selected, clear all existing nodes and edges first in the canvas. 
- Add the selected template nodes and edges after the canvas is cleared. 
- Make sure the starter template replaces the canvas instead of being added on top of existing work. 
- Fit the view after a template is loaded. 
- Keep this inside the existing collaborative canvas state. 

## scope limits

- Don't add template saving yet.
- Don't add custom user templates.
- Don't add server persistence.
- Don't change node or edge rendering behavior.
- Keep this focused on importing pre-defined templates.

## check when done

- Template data is defined using shared canvas types. 
- Import model renders template cards with preview. 
- Import action replaces the current canvas through the existing node and edge state flow. 
- Editor navbar includes the import entry point. 
- NPM run build passes 

