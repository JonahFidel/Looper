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

`render.yaml` is the Render blueprint for the public Looper web services.
Create a Blueprint from this repository in the Render dashboard and deploy those services.
All four services use the free plan, follow `master`, and attach no disk.
`looper` serves the current homepage.
`looper-mike-first` boots `public/scripts/old/version2.js` at [https://looper-mike-first.onrender.com/](https://looper-mike-first.onrender.com/).
`looper-jonah-first` boots `public/scripts/old/oldGame.js` at [https://looper-jonah-first.onrender.com/](https://looper-jonah-first.onrender.com/).
`looper-first-merge` boots `public/scripts/game2.js` at [https://looper-first-merge.onrender.com/](https://looper-first-merge.onrender.com/).
The homepage labels point at those three sites.
Service settings live in `render.yaml`.
Render uses the Node version in `.node-version` instead of `engines.node` in `package.json`.
The reason is noted at the top of `render.yaml`.
