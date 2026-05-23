this is the ui redesign and adding and editing features  for inside the canvas

remove the background for avatars, only show avatars 

on opening a project along with text connecting add a spinner and make the connecting... text larger

### sidebar
- use side bar from shadcn npx shadcn@latest add sidebar already installed
- use the same UI from sidebar as in /dashboard
- add dropdowns icon for the titles projects and shared and inside the dropdown show the projects that are there , only clicking on down arrow should open dropdown 
clicking on projects should go to /projects
clicking on projects should go to /shared

## in menu  
- change rename scene to rename project , on clicking open a dialog box to rename same as the dashboard, reuse it, also change text in /dashboard from rename scene to rename project
- make export image functional, show a dialog box showing the image and copy button 
the bottom with icon , on clicking copy should copy to clip board

## templates
- in templates change the import button color to primary

## avatars
- keep the avatars in color, don't need them in black and white
- on clicking avatars show simple menu with the icon of the user in color and their name

## share 
- change colors from cyan to primary color
- add a public link feature where clicking on it can share canvas with view only access, make the dialog neat and easy to understand

### mini map
- on the top right corner of the minimap , keep a small button to hide minimap and remove the minimap from the canvas, keep a less visible icon with 2 up arrows after hiding on minimap and on hover highlight it and on clicking make the minimap visible again

## shapes floating bar
redesign entireley
[ [select] [Hand] [shapes] [eraser] ]
- select: use square-dashed-mouse-pointer icon from lucide and clicking on it should functin to select inside the canvas, we have the shift + enter already designed use it and wire it accordingly
- hand: use hand icon from lucide clicking on hand should be for panning, we already have the function designed , wire it accordingly
- shapes: use shapes icon from lucide , hovering should show all the shapes that we currently have in a grid 
- eraser: use eraser icon from lucide, clicking should function to erase the node or edge, already have the function for backspace and delete wire it accordingly
- use the same hover effects that are currently there use dull version of primary color used in side bar in /dashboard to show selected icon 

## Ai sidebar
- while opening the sidebar, slide the elements on the to right along with the side bar, similar to mini map movement



sync the colors used on the branch
use buttons, button groups,drop-down menu,input,popover,separator,sidebar,spinner from shadcn in the entire repository whereever needed and change and add them globally in this branch
- npx shadcn@latest add button already installed
- npx shadcn@latest add button-group already installed
- npx shadcn@latest add dialog already installed
- npx shadcn@latest add dropdown-menu already installed
- npx shadcn@latest add input already installed
- npx shadcn@latest add popover already installed
- npx shadcn@latest add separator already installed
- npx shadcn@latest add sidebar already installed
- npx shadcn@latest add spinner already installed
