### Goal 
Redesign the editor UI into a modern floating canvas-first experience inspired by tools like Excalidraw while preserving the existing editor architecture.

This redesign focuses only on:

- floating navbar
- floating sidebar interactions
- avatar placement
- menu systems
- visual hierarchy
- floating surface system
- canvas-first layout behavior

Do not focus on previous implementation memory or unrelated editor logic

# Branch Rules

Create a dedicated branch before starting.

## Suggested branch:

```bash
git checkout -b redesign/floating-editor-ui
```

All redesign work must stay isolated inside this branch until stable.

- allowed to rewrite the @ui-context.md file
- use shadcn and lucide as instructed


- npx skills add shadcn/ui are already added
- npm install lucide@next is already added

Use the following design tokens globally.
| Purpose          | Color           | Hex       |
| ---------------- | --------------- | --------- |
| Primary          | Electric Purple | `#8B5CF6` |
| Primary Hover    | Soft Purple     | `#A78BFA` |
| Primary Pressed  | Deep Purple     | `#7C3AED` |
| Background       | Rich Dark       | `#0F0F12` |
| Surface          | Card Dark       | `#18181C` |
| Elevated Surface | Layer Dark      | `#23232A` |
| Border           | Subtle Border   | `#2E2E36` |
| Text Primary     | Soft White      | `#F3F4F6` |
| Text Secondary   | Gray            | `#9CA3AF` |
| Success          | Emerald         | `#10B981` |
| Error            | Rose Red        | `#EF4444` |

- for shadow glow  Use this glow consistently for active floating elements:
`box-shadow: 0 0 24px rgba(139, 92, 246, 0.35);`
- Avoid:
    - giant blurs
    - excessive neon
    - heavy layered shadows
    glow should remain sublte and premium 



### Navbar

# Navbar Layout
[left controls]     [center optional space]     [right controls]

use:
    - flex
    - gap spacing
    - floating groups



- keep all the elements floating remove the visible navbar and alter as specified below
- to the left use the same sidebar icons from lucide `panel-right-close` and `panel-right-open`
- to the right of sidebar icon, add a dropdown menu icon from lucide `menu`
    in the menu add the below options and use `npx shadcn@latest add dropdown-menu`, use icons
    menu items:
        | Action       | Suggested Icon |
        | ------------ | -------------- |
        | Rename Scene | Pencil         |
        | Copy Room ID | Copy           |
        | Export Image | ImageDown      |
        | Share        | Share2         |


# Project Name Editing

## To the right of menu icon:

- Display project title as:
  - *inline editable text*
  - *canvas-native interaction*

## Project Title States
- **Default**
  - `text-[#F3F4F6]`
- **Hover**
  - Text transitions to: `#8B5CF6`
  - Add:
    - smooth color transition
    - underline fade
- **Active Editing**
  - When clicked:
    - select entire text
    - editable inline
    - underline visible
    - transparent background
    - no input borders
  
### Style:
- border-none
- outline-none
- bg-transparent
- underline

## Saved Status Indicator
- Remove text-based save status.
- Replace with:
  - floating icon-only state
  
 
### Save Status Behavior:
- **Idle Saved:** Small muted check icon.
  
tooltip: "Saved"
hover tooltip: "Saving"
to indicate subtle spinner animation.
 
### Error:
display in rose red color.
tooltip: "Sync failed"

- Navbar should not span edge-to-edge.
- use: 
    - floating container
    - internal grouped sections




# Navbar Right Section

## Order:
- avatars → templates → share → AI → profile

*Keep spacing tight.*

## Avatar Group

### Place avatars:
- Left of templates button
- Inside floating navbar

## Avatar Rules

Use provided avatar group structure.

### Requirements:
- Grayscale inactive avatars
- Hover restores color
- Overlap spacing
- Subtle border ring

## Avatar Styling

Use:
```plaintext
gring-2 ring-[#18181C]
```
Maintain consistency with dark canvas.

## Avatar Overflow
When collaborators exceed visible limit:
- Use compact count chip
- Keep it circular
 - Elevated surface background  
Example: +3

- use the below code for avatar group

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

export function AvatarGroupCountExample() {
  return (
    <AvatarGroup className="grayscale">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
        <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://github.com/evilrabbit.png"
          alt="@evilrabbit"
        />
        <AvatarFallback>ER</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  )
}


sync the functionalities of the changes mentioned, all the functionalities already exist

keep all the others same
do not change anything else
this is strictly a UI change only
do not change backend logic or canvas state