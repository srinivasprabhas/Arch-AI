add resizing and inline label editing to canvas nodes

## implementation

1 add resizing
- selected nodes should show resize handles
- prevent nodes from being resized below a minimum size
- keep resize handles subtle and consistent with the dark canvas UI

2 add inline label editing
- keep the node label centered inside the node
- double click the center/label area of node to edit its label
- show placeholder text in the same centered position when the label is empty
- keep editing smooth without causing layout shifts
- show a text area directly over the label while editing
- update the label as users type
- close editing on blur or `escape`
- prevent text editing interactions from dragging or panning the canvas

3 keep all node updates connected to the existing collaborative canvas state

## scope limits

- don't change shape rendering from the previous unit
- don't change the shape panel or drag review
- don't change how dropped nodes are created
- keep this focused on resize and label editing only


## check when done 

- selected nodes show resize handles
- resizing updates node dimensions through the existing node state flow
- double clicking a node opens inline label editing
- Label editing updates node labels through the existing sync flow 
- Editing closes on blur or escape 
- Text interactions do not trigger canvas drag or pan 
- `npm run build` passes without type errors 