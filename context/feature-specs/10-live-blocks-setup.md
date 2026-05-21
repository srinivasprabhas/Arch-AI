set up real time colloaboration infrastructure using liveblocks

## configuration

configure the liveblocks.config.ts at the project root

Define:

### presence

- cursor position
- 'isThinking' Boolean

### UserMeta

- user Id
- display name
- avatar URL
- cursor color

## liveblocks client

create a cached liveblocks node client int lib

add a helper that deterministically maps a user id to a consistent color from a fixed palette

## Auth route

create POST /api/liveblocks-auth

use the project id as the liveblocks room ID

this route must:

1 require clerk authentication
2 verify project access using the existing helper
3 ensure the liveblocks room exists ( create only if needed)
4 return a session token with:
	- user name
	- avatar
	- generated cursor color

return 403 for unauthorized project access

## Dependencies

All required liveblocks packages are already installed

## Check when done

- liveblocks.config.ts defines presence and usermeta
- liveblocks client is cached
- auth route verifies project access
- user metadata is attached to sessions
- npm run build passes
