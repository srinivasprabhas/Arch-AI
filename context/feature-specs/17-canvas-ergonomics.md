Add a floating control bar for zoom and undo or redo then wire the same actions to keyboard shortcuts 

## implementation

1 add a pill-shaped control bar at the bottom left of the canvas

It should sit above the shape panel and include two groups 
Zoom controls:
- Zoom Out
- Fit View
- Zoom In
History Controls:
- Undo
- Redo

2 wire the zoom in controls to the React Flow instance
- Zoom in
- Zoom out
- Fit view
- Use a shot animation so the movement feels smooth

3 wire undo and redo to live blocks history
Use the existing LiveBlocks undo or redo hooks.
- Disable undo when there is nothing to undo.
- Disable redo when there is nothing to redo.
- Keep disabled buttons visually dimmed.

4 create a `usekeyboardshortcuts` hook in `hooks/`

The hook should:
- receive the React Flow instance
- receive undo and redo handlers
- listen for keyboard shortcuts on the window
- ignore shortcuts while typing in inputs, text areas, or editable text fields

5 support these shortcuts:
- Plus or = to zoom in
- Minus to zoom out
- Command or Control+Z to undo
- Command or Control+Shift+Z to redo
- Command or Control+Y to redo

6 reduce the size of the mini map at the bottom right. 

## scope limits
- Don't change the shape panel.
- Don't change node or edge rendering.
- Don't add extra canvas controls.
- Don't change the existing collaborative state setup.

## check when done
- Control bar is added to the canvas. 
- Zoom actions use the React Show instance. 
- Undo and redo use Livebox history. 
- Keyboard shortcuts are handled in Hooks/Use Keyboard Shortcuts. 
- Shortcut handling skips editable fields. 
- NPM run build passes