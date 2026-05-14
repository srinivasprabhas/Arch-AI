wire the editor home sidebar and dialogs to the real project API

### Data fetching

the editor home is a server component

fetch owned and shared projects server side using the existing project data helper and pass both lists to the side bar

no client side fetching for initial load


### use project actions

create a hook in hooks/ that manages dialog state and project mutations

***create***

- manage create dialog state
- manage project name input
- generate a short unique suffix
- slugify the name to create the room Id
- call POST  /api/projects

the project id and live blocks room id should stay aligned

***rename***

- store target project id + current name
- call patch /api/projects/[id]
- refresh on success

***Delete***

- store target project
- call DELETE /api/projects[id]
- redirect to /editor if deleting the active workspace
- otherwise refresh

### wiring

connect the hook to the sidebar and dialogs

- create dialog shows room id preview
- rename dialog prefills current name
- delete dialog shows project name

### check when done

- sidebar uses real project data
- create navigates to workspace
- rename updates correctly
- delete refreshes or redirects correctly
- npm run build passes