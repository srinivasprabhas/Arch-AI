replace the placeholder node renderer with proper shape rendering and drag review

## implementation

1 replace the placeholder node shape rendering
- rectangle, pill, and circle should use css styling
- diamond, hexagon and cylinder should render with svg shapes
- svg shapes should scale at rest and brighter when selected

2 add a shape drag preview
- when draggind a shape from the shape panel, show a ghost preview of that shape
- keep the preview attached to the cursor while dragging
- use the same shape type and default size that will be used on drop
- hide the preview after the shape is dropped or the drag is cancelled
- keep this limited to drag preview behavior only

3 keep node rendering connected to the existing collaborative canvas state

## scope limits

- don't rebuild shape panel layout
- don't change how dropped nodes are created
- don't add resize or label editing yet
- keep drag/drop changes limited to the ghost preview only

## check when done

- nodes render the correct shape variant for each type
- css shapes render correctly for rectangle, pill and circle
- svg shapes render and scale correctly for diamond, hexagon and cylinder
- shape dragging shows a ghost preview matching the dragged shape
- npm run build passes