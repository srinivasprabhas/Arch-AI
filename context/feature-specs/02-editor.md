We need the base chrome components that frame, every editor screen, the top navbar and the left sidebar shell: these will be reused and extended in every chapter that follows.

### Editor Navbar

create components/editor/editor-navbar.tsx

Requirements:
- Fixed height top Navbar left, center and right sections
- Left section contains sidebar toggle button
- Use panel left open / panel left close icons based on the sidebar state
- Right section stays empty for now
- Dark background with subtle bottom border

### Project Sidebar

create components/editor/product-sidebar.tsx

- Sidebar should not float above the editor canvas.
- Opening it should not push page content.
- Slides in from the left.
- Accepts is open prop.
- Header with projects title plus close button.
- Shadcn and tabs: My projects, shared.
- Both tabs show empty placeholder state.
- Full width new project button at the bottom with plus icon.

### Dialog Pattern

use existing color tokens from globals.css for dialog styling

support:
- title
- description
- footer actions

do not build actual dialogs yet

### check when done

- new components compile without typescript errors
- no lint errors
- fialog pattern is ready for future use
