the database schema is ready. build the backend project API routes only

## Routes

create REST endpoints for:

- GET /api/projects , list current user's projects
- POST /api/projects , create project
- PATCH /api/projects/[projectId] , rename project
- DELETE /api/projects/[projectId] , delete project

## Rules

use the authenticated clerk user id as ownerId

when creating:
- default missing project name to untitled project
- use the schema's existing Id strategy, do not add sequential Ids

security:

- unauthenticated requests return 401
- only the project owner can rename or delete
- non-owner mutations return 403

keep this backend only. Do not wire the UI yet


## check when done

- routes exist for list/create/rename/delete
- owner checks are enforced for rename/delete
- 401 and 403 responses are handled correctly
- npm run build passes