# Kanban Redmine

A simple web application for working with Redmine issues as a Kanban board.

## Features

- 🔐 Authentication via Redmine API key
- 📋 Project selection from the list of available projects
- 📊 Kanban board with columns by issue status
- ✨ Drag & Drop to move issues between statuses
- ➕ Create new issues
- 🔄 Automatic sync with Redmine
- 💾 Settings saved in localStorage

## Tech Stack

- **Vue 3** — reactive UI framework
- **Vite** — build tool and dev server
- **Pinia** — state management (immutable patterns)
- **Vue Router** — routing
- **SortableJS** — drag & drop
- **Zod** — data validation

## Installation and Running

### Requirements

- Node.js >= 16
- npm or yarn
- Access to a Redmine server with API enabled

### Install dependencies

```bash
npm install
```

### Development mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (port can be changed via `VITE_DEV_PORT` in `.env`).

### Production build

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview production build

```bash
npm run preview
```

## Redmine Setup

### How to get an API key

1. Log in to your Redmine
2. Go to **My account**
3. On the right, find **API access key**
4. If there is no key, click **Show** or **Generate**
5. Copy the key

### URL format

The URL must point to your Redmine root:

```
✅ Correct:
https://redmine.example.com
http://localhost:3000

❌ Incorrect:
https://redmine.example.com/
https://redmine.example.com/projects
```

### Verify API access

Ensure that in Redmine settings the following option is enabled:
**Administration → Settings → Authentication → "Enable REST web service"**

## Usage

### 1. Authentication

On first run, enter:
- **Redmine URL** — your Redmine server address
- **API Key** — API access key

Data is stored in the browser’s localStorage.

### 2. Project selection

After authentication, choose a project from the list. The app remembers the last selected project.

### 3. Working with the board

- **View issues**: issues are shown in columns by status
- **Move issues**: drag an issue card to the desired column (drag & drop)
- **Create issue**: click the "+ Create issue" button in the header
- **Refresh data**: click "↻ Refresh" to sync with Redmine

### Creating an issue

When creating an issue, specify:
- **Subject** (required) — short description
- **Description** (optional) — detailed description
- **Tracker** (optional) — issue type (Bug, Feature, etc.). If not selected, the project’s first tracker is used.

The new issue gets the project’s initial status and appears on the board.

**Note**: Only trackers assigned to the project are shown. If you see "Object cannot be empty", check that the Redmine project has no required custom fields left empty.

## Architecture

### Project structure

```
kanban-redmine/
├── src/
│   ├── api/
│   │   ├── redmineClient.js      # HTTP client for Redmine API
│   │   └── redmineEndpoints.js   # Endpoint helpers
│   ├── components/
│   │   ├── common/
│   │   │   └── AppErrorBanner.vue
│   │   ├── issues/
│   │   │   ├── CreateIssueModal.vue
│   │   │   └── IssueCard.vue
│   │   └── kanban/
│   │       ├── KanbanBoard.vue
│   │       └── KanbanColumn.vue
│   ├── pages/
│   │   ├── BoardPage.vue
│   │   ├── LoginPage.vue
│   │   └── ProjectPickerPage.vue
│   ├── router/
│   │   └── index.js              # Route configuration
│   ├── stores/
│   │   ├── auth.js               # Auth store
│   │   └── board.js              # Board data store
│   ├── utils/
│   │   ├── errors.js             # Error handling
│   │   └── validate.js           # Validation (Zod)
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Data flow

```
LoginPage → ProjectPickerPage → BoardPage
     ↓              ↓                ↓
localStorage    Redmine API    Pinia Stores
```

### Immutability

All state changes are done by creating new objects/arrays:

```javascript
// ✅ Correct (immutable)
this.issues = [...this.issues, newIssue]

// ❌ Wrong (mutation)
this.issues.push(newIssue)
```

### Optimistic updates

When moving an issue:
1. UI updates immediately (optimistic)
2. Request is sent to Redmine API
3. On error — UI rolls back to the previous state

## Limitations and notes

### Redmine workflow

⚠️ **Important**: Moving issues between statuses is limited by Redmine workflow settings.

If the workflow does not allow a transition from status A to status B, dragging the issue will show an error and the card will revert.

**Example**:
- Workflow allows: "New" → "In progress" → "Closed"
- Not allowed: "New" → "Closed" (skipping "In progress")

### CORS

Redmine may not send CORS headers, so the browser can block requests from another origin.

**For development**, use a proxy via an environment variable:

1. Create a `.env` file in the project root
2. Add (replace with your Redmine URL):

   ```
   VITE_REDMINE_PROXY_TARGET=http://192.168.15.22:3000
   ```

3. Restart `npm run dev`
4. On the login form, enter the same Redmine URL (`http://192.168.15.22:3000`)

**Note**: The app defaults to port 5173 to avoid conflicting with Redmine on 3000. If Redmine uses another port, set it in `VITE_REDMINE_PROXY_TARGET`. To use port 3000 for the app, add `VITE_DEV_PORT=3000` to `.env` (then Redmine must use a different port).

Requests will go through localhost, so CORS will not apply.

### Pagination

The app loads **all** project issues when opening the board. For large projects (>1000 issues) this can take a while.

### Permissions

Ensure your API key has:
- View projects
- View issues
- Create issues
- Edit issues (for moving between statuses)

## Troubleshooting

**"inject() can only be used inside setup()"** and **"Cannot read properties of undefined (reading 'push')"** when selecting a project — `useRouter()` and other composables (inject) must be called only in `setup()`, not in methods. Fixed: router is obtained in setup() and used in methods via `this.router`.

**"Cannot read properties of undefined (reading 'push')" on the board** — occurred when navigating away from the board during refresh. Fixed with race-condition protection in KanbanBoard.

**"Object cannot be empty" when creating an issue** — possible causes:
1. **Tracker**: the app sends a tracker automatically (selected or first in project). Ensure the project has at least one tracker (Project settings → Modules → Trackers).
2. **Required custom fields**: if the project has required custom fields, fill them in the Redmine web UI or make them optional in workflow settings.

## Error handling

The app handles common errors:

- **401** — Invalid API key
- **403** — Insufficient permissions
- **404** — Resource not found
- **422** — Invalid data (e.g. disallowed status transition)
- **5xx** — Redmine server error
- **Timeout** — Request timeout (30 sec)
- **Network** — No connection to server

Errors are shown in a banner with a "Retry" button.

## Security

⚠️ **API key is stored in the browser’s localStorage in plain text.**

Do not use this app on shared or public computers.

For production we recommend:
- HTTPS for Redmine
- Session-based auth instead of API key in localStorage
- Backend proxy to hide the API key

## Development

### Coding guidelines

- **Immutability**: always create new objects
- **Small files**: 200–400 lines, max 800
- **Error handling**: try-catch for all async operations
- **Validation**: use Zod for user input
- **No console.log**: use proper error handlers

## Known issues

1. With many issues (>1000), initial load can be slow
2. No issue filtering/search on the board
3. Issue change history is not shown
4. Existing issues cannot be edited (only status via drag & drop)

## Roadmap

- [ ] Filter issues by tracker, priority, assignee
- [ ] Search issues on the board
- [ ] Edit issues
- [ ] Show comments
- [ ] Virtual scrolling for large projects
- [ ] Real-time change notifications

## License

MIT

## Author

Aleksei Ilyin
