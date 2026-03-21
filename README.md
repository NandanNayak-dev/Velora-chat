# Velora Chat

Velora Chat is a private group chat application built with Node.js, Express, MongoDB, EJS, and Passport. It is designed around invitation-only group access: users can create groups, share a private token with selected people, and chat only inside groups they belong to.

## What The Project Does

The app provides a lightweight group messaging workflow with server-rendered pages and session-based authentication.

Key capabilities:

- User signup, login, logout, and persistent sessions
- Group creation with an automatically generated private invite token
- Joining a group only through a valid token
- Group chat with message posting
- Message editing and deletion by the message author
- Group member removal by the group admin
- Group leaving for regular members
- Invite token regeneration by the group admin
- Access control so non-members cannot open private group chats

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- EJS templating
- Passport and `passport-local-mongoose` for authentication
- `express-session` and `connect-flash`

## Project Structure

```text
Velora-chat/
|-- app.js
|-- middleware.js
|-- models/
|   |-- user.js
|   |-- group.js
|   |-- message.js
|-- routes/
|   |-- auth.js
|   |-- groups.js
|   |-- messages.js
|-- views/
|-- public/
|-- package.json
```

## How It Works

1. A user signs up or logs in.
2. The user creates a new group or joins an existing one using a private token.
3. Group membership is stored in both the group document and the user document.
4. Only members of a group can view its messages or send new ones.
5. Admins can manage access by removing members or regenerating the invite token.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB running locally or a MongoDB connection string

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root if you want to override the defaults:

```env
DB_URL=mongodb://127.0.0.1:27017/chatapp
SESSION_SECRET=your-session-secret
PORT=8080
```

If `DB_URL` is not provided, the app connects to:

```text
mongodb://127.0.0.1:27017/chatapp
```

### Run The App

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

## Default Behavior And Permissions

- A group creator becomes the group admin
- The admin is also added as a member of the group
- Only group members can access a group page
- Admins can see and regenerate the invite token
- Regular members can leave a group
- Admins cannot leave their own group unless that behavior is added explicitly

## Possible Improvements

- Admin transfer before leaving a group
- Real-time messaging with WebSockets or Socket.IO
- Typing indicators and message read states
- Better moderation and audit controls
- Automated tests for auth, membership, and messaging flows

## Status

This project is a minimal private group chat application intended for learning, iteration, and feature extension.




--10/3/2026