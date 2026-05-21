Show active room participants inside the editor canvas view without changing the editor home nav bar 

## implementation 

1 keep the existing NAVBA behavior as is 
- Do not change the editor-home navbar. 
- Do not move or redesign the shared navbar component globally. 
- If the editor-home and the editor-canvas use the same navbar component, make sure this presence UI only appears in the canvas or editor room view 

2 add the participant avatar group inside the editor canvas area. 
- Position it in the top right corner of the editor canvas view. 
- Keep it visually separate from the main navbar actions. 
- Get the current user's ID from the active clerk session. 
- Filter the LiveBlocksPresence list to exclude any entry whose user ID matches the current clerk user ID. 
- Render the filtered list as collaborator avatars only. 
- Render the current users separately using the existing clerk user button. Do not render a second avatar for them from the live blocks presence list. 
- Keep collaborator avatars and the clerk user button the same size so the group looks visually consistent. 
- Collaborator avatars are display only, not interactive. 
- Show a divider between the collaborator avatars and the clerk user button only when at least one collaborator exists. 
- If no collaborators are present, show only the clerk user button with no divider. 

3 render collaborator avatars

- Use profile photos when available.
- Fallback to initials when there is no image.
- Show up to five collaborative avatars in an overlapping stack.
- Show a plus and an overflow chip when there are more than five.
- Add a subtle ring so avatars stay readable on the dark canvas.

4 add live cursors to the canvas. 
- Render cursors for other participants only, never the current user.
- Use the existing Livebox presence date to broadcast cursor position.
- Update cursor position on React flows on mouse move event.
- Clear cursor to null on mouse leave.
- Show a small colored pointer with a name badge attached.
- Match the pointer and badge color to the participant's presence color.

5 define the shared presence type in liveblocks.config.ts. 

Presence should include:
- cursor : {x: number; y:number } | null
- thinking: boolean

## scope limits

- Don't add participant avatars to the shared navbar globally.
- Don't remove existing navbar actions like save, import, share, or AI.
- Don't replace clerk, user, or profile logout behavior.
- Don't make collaborator avatars interact.
- Don't change canvas node or edge behavior.

## check when done

- Presence avatars only appear in the editor canvas view. 
- Editor home navbar is unchanged. 
- Current user is resolved from the active clerk session. 
- Collaborator avatars exclude the current user. 
- Divider only appears when collaborators exist. 
- Cursor position is broadcast via LiveBlocks presence on exact flow mouse events. 
- Canvas renders live cursors for other participants only and NPM run build passes. 