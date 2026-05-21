Replace the default canvas edges with the custom edges that feel easier to follow, easier to click, and support inline labels 

## implementation

1 add connection handlers to every node 
- Place handles on the top right, bottom, and left sides.
- Users should be able to connect from any handle to any other handle.
- Keep the handle subtle: small white dots with a dark border.
- Hide them by default and fade them in when hovering the node.

2 add a default style for the new edges. 
- Use a light stroke with rounded ends.
- Add an arrowhead at the end of each node.
- Make new connections use the custom canvas edge renderer. 

3 create the custom edge renderer. 
- Use clean right angle routing. 
- Keep edges slightly dimmed at rest. 
- Brighten edges when hover or selected. 
- Make edges easier to hover and click without increasing the visible line thickness. 

4 add inline edge to edit its label
- Double click an edge to edit its label. 
- Use react-flows edge label renderer and the path midpoint coordinates from get smooth step path to position the label. 
- Do not calculate midpoint position manually. 
- Use an input that grows with the label text. 
- Save the label on blur, enter, or escape. 
- Show the saved label as small pill badges. 
- When an active edge has no label, show a faint hint. 
- Prevent label clicks and typing from dragging or panning.
- update labels through the existing collaborative edge flow

## scope limits

- Don't change how nodes are created.
- Don't change the shape panel.
- Don't redesign the node renderer beyond the required connection handles.
- Keep this focused on edge rendering labels and connection behavior.

 ## check when done

- Nodes have handles on all four sides.
- New edges use the custom canvas edge type with arrows.
- Edge hover selection and label editing are handled in the custom edge renderer.
- Edge label position uses edge label renderer and path midpoint coordinates.
- Edge labels update through the existing edge data flow.
- NPM run build passes without type errors.