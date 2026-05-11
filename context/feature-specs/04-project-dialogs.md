## Goal

Build the /editor home screen and add project dialogs/sidebar actions. no API calls or persistence yet

## Editor home

reuse the existing editor layout. Do not modify the navbar or sidebar behaviour

In the center of the page add:
- heading: create a project or open an existing one
- description: start a new architecture workspace or choose a project from sidebar
- New Project button with a plus icon

keep the layout minimal. do not wrap this content in cards

clicking new project should open the create project dialog

### create project

- project name input
- live slug preview based on the name
- preview updates as the user types

### Rename project

- prefilled project name input
- current project name as shown in the description
- input auto focuses
- enter submits

### delete project

- destructive confirmation
- no input
- confirm button uses destructive styling


## sidebar
add project item actions:
- rename 
- delete

show actions only for owned projects

Hide actions for shared/collaborator projects

on mobile:

- tapping outside the sidebar closes it
- add a backdrop scrim

## Implementation

create a dedicated hook to manage:

- dialog state
- form state
- loading state

wire:
- editor home new project -> create dialog
- sidebar create -> create dialog
- sidebar rename -> rename dialog
- sidebar delete -> delete dialog
use mock project data only .do not add API calls or persistence

## check when done

- sidebar actions are wired
- slug preview works
- no typescript errors
- no lint errors