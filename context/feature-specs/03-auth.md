CLERK is already installed and connected, wired into the next.js app: Provider, pathpages, redirects, route protection, and user menu

### Design

use Clark's Dark theme from @clerk/ui/themes as the base

Override clerk appearance variables using the app's existing CSS variables. Do not hardcode colors.

### Sign-in and sig-up pages:

- Large screens:  Simple two-panel layout
- Left: compact logo, tagline, short text only, feature list
- Right: centered clerk form  
- Small screens:  Form only
- No gradients
- No oversized hero sections
- No feature cards
- No scroll-heavy layouts

Keep the layout minimal and professional.

### Implementation

- wrab the route layout with Clark provider using Clark's dark theme.
- Create sign-in and sign-up pages using Clark components.
- Use proxy.ts at the project route, not middleware.ts.
- Define public routes using the existing sign-in and sign-up env vars.
- Protect everything else by default.

Whatever is there in the editor file has been Put everything  editor.

update / :
- authenticated users redirect to /editor
- unauthenticated users redirect to /sign-in

Add Clerk's built-in user button to the editor navbar right section for profile settings and logout.

Keep Clark's default user menu and profile flows intact. Do not rebuild or heavily customize Clark internals.

Use existing Clark env wires. Do not rename or invent new ones.

### dependencies
install : @clerk/ui

### check when done

proxy.ts exists at the root
all routes are protected except public auth paths
auth pages use css variables with no hardcoded colors
clerk provider wraps the root layout 
npm run build passes