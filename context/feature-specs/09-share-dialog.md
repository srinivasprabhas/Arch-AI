Add a share button to the editor navbar that opens the share dialog

owners can:

- invite collaborators by email
- view current collaborators
- remove collaborators
- copy the project link with temporary 'copied!' feedback

collaborators can:
- view the collaborator lists only
- not invite, remove, or manage access

## clerk user data

collaborators are stores by email in the database

use clerk backend API to enrich collaborators emails with:

- display name
- avatar image

if a clerk user is not found for an email , fall back showing the email only

## implementation

add the required API logic for :

- listing collaborators
- inviting collaborators
- removing collaborators

Enforce ownership server side for invite and remove actions

do not add a local user table

## check when done

- share dialog opens from the workspace
- owners can invite and remove collaborators
- collaborators see read only access
- collaborator names/avatars load from clerk when available
- npm run build passes
