prisma is already installed. add the project data models. prisma client singleton and first migration

##models

create prisma/models/project.prisma

add Project:

- owner ID mapped to clerk user
- name
- optional description
- status Enum: DRAFT , ARCHIVED
- canvasJsonPath for future canvas blob storage
- timestamps
- indexes on owner ID and creation date

add ProjectCollaborator:

- project relation with cascade delete
- collaborator email
- creation timestamp
- unique constraint on project/email
- indexes on email and project/date

do not add extra fields unless required by prisma


## prisma client

create lib/prisma.ts as cached singleton

branch by DATABASE_URL:

- if it starts with prisma+postgres:// use accelerate
- otherwise use direct @prisma/adapter-pg

cache the client on global in development for hot reloads

## migrations

runt the migration and generate the client

## Dependencies

Already installed

- prisma
- @prisma/client
- @prisma/adapter-pg
- pg

## Check when done

- schema has both models with correct relations and indexes
- lib/prisma.ts exports one cached prisma instance
- migrations runs successfully
- npm run build passes