Add a small floating color toolbar so selected notes can change both their background and text color directly from the canvas 

## implementation

1 check ui-context.md for the node color palette 
 each palette option includes
- a node background color
- a matching text color

2 add a toolbar above selected nodes. 
- Only show it when the node is selected. 
- Keep it slightly above the node without overlapping it. 
- Show one swatch per color pair. 
- Active swatches should feel clearly selected.
- Hovering swatch should show a subtle glow based on its text color. 
- Keep the glow tight and controlled not overly blurred. 
- Prevent toolbar interactions from dragging nodes or panning the canvas. 

3 when a swatch is selected
- Update both the note background color and text color.
- Update the node UI immediately.
- Keep this inside the existing collaborative canvas state.
- No server calls

4 selected nodes should visually reflect their active color pair

the node background updates to the selected color, and the text automatically updates to its paired text color 

## scope limits
- Don't change drag or drop behavior.
- Don't rebuild node selection logic.
- Don't add a full color picker.
- Keep this focused on pre-defined color themes only.

## check when done

- Nodes use predefined background or text color pairs.
- Selected nodes show a floating color toolbar swatch.
- Selection updates both node and text colors.
- npm run build passes without type errors.
