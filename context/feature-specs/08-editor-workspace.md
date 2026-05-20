build the /editor/[roomId] workspace shell with server side access checks, no canvas logic yet

## Access

/editor/[roomId] must be a server component

Before rendering:

- unauthenticated users redirect to /sign-in
- users without project access see Access Denied
- non existent projects also show Access Denied

create components/editor/access-denied.tsx with:

- centered layout
- lock icon
- short message
- link back to /editor

## Access Helpers

create lib/project-access.ts with helpers for:

- getting current clerk identiy: userId + primary email
- checking project access by owner or collaborator

## Layout

build a full-viewport workspace with:


- top navbar showing the project name
- navbar actions: share button and AI sidebar toggle
- existing ProjectSidebar on the left
- current room highlighted in the sidebar
- central canvas placeholder with dark background and centered message
- right sidebar placeholder for future AI chat

the canvas area should fill the remaining space

## Scope

Do not add real canvas logic, live blocks, AI chat, or sharing behaviour yet.

## Check when Done

- /editor/[roomId] builds successfully
- access helper exists outside page component
- AccessDenied is used for missing or unauthorized projects
- workspace layout renders with current project context
- no typescript errors

