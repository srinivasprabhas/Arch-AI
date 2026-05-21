Versus Generated Spec with Versal, Blob, and Prisma. Then add SQL download role so users can retrieve their generated spec files 

### implementation
1 projectspec model
ensure a projectspec prisma model exists with:
- id
- projected ( relational to project)
- filepath (blon URL path)
- createdAt

Use this model for metadata only. The actual spec content should live in Versal Blob. 

2 save generated spec

after a spec is generated:

- Upload the markdown content to Versal Blob. 
- Store the blog URL or path in projectspec.filepath
- Make the record to be the correct project. 
- Follow the same metadata plus block pattern used for canvas persistence. 

3 download route 
create a route like: GET /api/projects/[projectId]/specs/[specId]/download

it should:
- Authenticate the user.
- Verify access to the project.
- Verify the spec down to that project.
- Fetch the file using project spec.file path.
- Return it as a downloadable markdown file.
- Handle not found and forbidden cases properly.

### scope limits

- Do not add content or UI logic.
- Do not store spec content in Prisma.
- Do not extra blob URLs without access checks.
- Do not modify existing canvas persistence.

### notes
- check context/project-overview.mds and context/architecture-context.md first
- Preview existing project fracture patterns. 
- Prisma stores metadata. Versal Blob stores context. 

### check when done

- projectspec model exists with required fields
- spec is uploaded to vercel blob
- filepath is saved correctly
- download route validates access before returning file
- response is a markdown attachment
- typescript and build passes