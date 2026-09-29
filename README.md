# Looper

Looper is a browser WebGL game with a Node.js server.

## Running locally

Use the Node.js version pinned in `.node-version`.

```sh
npm install
npm start
```

Open [http://localhost:5000/](http://localhost:5000/).

## Publishing

`render.yaml` is the Render blueprint for the public `looper` web service.
Create a Blueprint from this repository in the Render dashboard and deploy that service.
Service settings live in `render.yaml`.
Render uses the Node version in `.node-version` instead of `engines.node` in `package.json`.
The reason is noted at the top of `render.yaml`.
