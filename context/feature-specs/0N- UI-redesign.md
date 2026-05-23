work in the same branch

The current opening redirects to /editor after signing in. We'll change that. We don't want to redirect it to /editor. We'll make /dashboard as a new route 

refer @C:\Users\p8900\Desktop\arch-ai\context\Images\Screenshot 2026-05-23 114704.png

Once the user enters the website and after signing in, he should be redirected to /dashboard, where he can see the dashboard as per the image that I've described. The sidebar is always open. It has the name of that person and it has dashboard, projects, and shared buttons on the left there should be an icon and the text and it should highlight. The side bar should always stay open and the side bar should highlight whatever route we are in. 
The bottom of the sidebar contains the account, remove the account from inside the canvas and keep it to the left of the sidebar in the bottom with the avatar and name

The dashboard page contains the dashboard title and to the right we have a button that says "Create new project". Below that we have the templates, which are ready-made templates that we have made. The template section is slidable and only has one row, which has the cards view

All the views of the projects and templates should be in card views displaying what's inside, similar to that of a mini-map function. 

The top section would be the dashboard, the button to the right, followed by a line with less opacity and subheading type templates to the left and 4 cards by default having templates

And then followed by a line. The next section would be your project. As you can see, all the projects, the grid should have four columns and in one line we can have four cards containing each project. Each card has a project and the name below it and it could be expanded to any number of projects. As the number of projects grows, the number of rows keeps adding. Below that we should show projects with active collaboration where the projects are shown only when there are active collaborators inside the canvas. 


And in the sidebar clicking on the project shows the only project section and the shared project shows the shared section, shared project section, where we see the projects shared with us

Each card functions as an access to canvas so clicking on that project should open the canvas and go to /editor route page. 

The projects and the shared buttons functions are already there so you use them accordingly. Check the existing functions first and then implement accordingly. 


The create new project button functions as a create new project and temporarily keep the project name as "unassigned" after creating a new project. Directly redirect them to the editor created with the name "unassigned" or "untitled scene" so they can edit later. If they create a new one, keep the name as "untitled scene 2" or "untitled 2" or "unnamed 2", so "unassigned 2". 

And in the project card in the dashboard page, projects page and Shared project The card should  display what is inside with respective colors inside the canvas 

new routes will be

/dashboard 
/projects
/shared

In the sidebar at the top, we display the name. By clicking the name, double-clicking down, they can change the name.
 

### Out of scope
 Do not touch any backend  logic. Do not do unnecessary executions . Only sync the functions at once. Do not touch the canvas except the profile of the account repososition. Reposition it into a sidebar bottom