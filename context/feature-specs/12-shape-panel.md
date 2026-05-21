add a shape panels so users can drag shapes onto the canvas and create new nodes 

## implementation

1 add a floating pill shaped toolbar at the bottom center of the canvas

2 add draggable icon buttons for these shapes:
- rectangle
- diamond
- circle
- pill
- cylinder
- hexagon

3 when dragging a shape, include shape name and default size in the drag payload

use sensible default sizes:
- rectangles should be wider than tall
- circles should be square
- diamonds should be slightly larger so labels have room

4 add dragover and drop handling the canvas wrapper

5 on drop:
- read the dragged shape payload
- convert the screen position to canvas coordinates using react flow
- create new node at that position
- use an empty label
- use the default node color
- use the dragged shape value

6 generate each node ID using the shape name, timestamp, and a counter

7 add a basic renderer for the custom canvas node type so new nodes are visible

for this unit render for the custom canvas node type so new nodes are visible


## check when done

- shape drag payload includes the correct shape and size data
- drop logic creates new canvas nodes with the expected shape data
- new nodes use the custom canvas node type
= npm run build passes