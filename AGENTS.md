# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This repo (`FukaseDaichi/udonarium_murder`) is a **fork of [TK11235/udonarium](https://github.com/TK11235/udonarium)** — a browser-based, serverless online tabletop (TRPG) tool — customized for **murder mystery (マーダーミステリー)** sessions. The app is pure client-side Angular: all game logic runs in the browser and peers sync directly over WebRTC. There is no application server (the in-progress SkyWay migration adds only a thin token-issuing function; see below).

### Staying in sync with upstream

Upstream changes are merged periodically (`git fetch upstream && git merge upstream/master`). Only `origin` is configured by default, so add the remote first:

```bash
git remote add upstream https://github.com/TK11235/udonarium.git
```

When resolving merge conflicts, **preserve fork-specific additions**: murder-mystery UI, the PDF viewer (`ng2-pdf-viewer`), `AppConfigCustomService` (viewer mode), and OGP/README customizations.

## Commands

```bash
npm install              # install deps
ng serve                 # dev server at http://localhost:4200 (live reload); needs a SkyWay key in config.yaml
ng build                 # production build → dist/udonarium/
npm run watch            # development build, rebuild on change
ng test                  # Karma + Jasmine in Chrome (watch mode)
```

Running a **single test**: focus with `fdescribe`/`fit` in the `.spec.ts` file, or scope by path: `ng test --include='**/object-store.spec.ts'`. For a one-shot headless run: `ng test --watch=false --browsers=ChromeHeadless`.

**To actually run the app you need a SkyWay signaling key** in `src/assets/config.yaml` (`webrtc.key`). Without it the app loads but peers cannot connect. The committed key may be expired — the old SkyWay Community Edition is shut down (see migration below).

## Architecture

### The synchronized-object model (the core abstraction)

This is the single most important thing to understand, and it spans `src/app/class/core/`. **Every piece of shared game state is a `GameObject` subclass, and mutating a synced field automatically replicates it to all peers** — you almost never send network messages by hand.

The mechanism (`core/synchronize-object/`):

- Annotate a class with `@SyncObject('alias')` and fields with `@SyncVar()` (from `decorator.ts`).
- `@SyncVar()` rewrites each field into a getter/setter backed by `context.syncData` (`decorator-core.ts`). The setter calls `update()`, which bumps the object's version and enqueues a broadcast.
- `ObjectStore` (singleton, `object-store.ts`) is the in-memory registry of every object, keyed by `identifier` (UUID) and `aliasName`. `update()` flows through it → `EventSystem` → `Network`.
- On the receiving peer, `ObjectSynchronizer` (`object-synchronizer.ts`) reconciles object versions using catalogs; `ObjectSerializer` (`object-serializer.ts`) converts objects to/from **XML**, which is also the save/transfer format.

Object hierarchy:

- `GameObject` → base (identity + versioned `ObjectContext`).
- `ObjectNode` (`object-node.ts`) → adds a parent/children tree; on an `ObjectNode`, `@SyncVar()` fields are stored as XML **attributes** (`syncData.attributes`).
- `TabletopObject` → base for on-table pieces. Concrete pieces (in `src/app/class/`): `GameCharacter`, `Card`, `CardStack`, `DiceSymbol`, `Terrain`, `GameTableMask`, `TextNote`.
- `DataElement` → key/value trees used for character-sheet style data.

### Global singletons (used everywhere)

- **`EventSystem`** (`@udonarium/core/system`) — pub/sub bus: `EventSystem.register(this).on('EVENT', cb)` to listen, `EventSystem.call('EVENT', data)` to emit. It bridges local events onto the network, so the same event fires on every connected peer. Key events: `UPDATE_GAME_OBJECT`, `DELETE_GAME_OBJECT`.
- **`Network`** (`@udonarium/core/system`) — WebRTC/SkyWay abstraction with a batched send queue supporting broadcast / unicast / echocast (self).
- **`ObjectStore`** — the object registry described above.

### UI and services

Angular components (`src/app/component/`) render and mutate game objects and subscribe to `EventSystem` events to re-render. Services (`src/app/service/`) coordinate cross-cutting concerns — e.g. `TabletopService`, `ChatMessageService`, `SaveDataService` (room save/load as ZIP), `ImageService`, `PanelService`/`ModalService` (windowing). The app uses a single `NgModule` (`app.module.ts`), not standalone components.

### File sharing

`core/file-storage/` shares images and audio peer-to-peer in chunks (`buffer-sharing-task`, `image-sharing-system`, `audio-sharing-system`) into `ImageStorage` / `AudioStorage`. Rooms are saved/loaded as ZIP archives (`SaveDataService` + `file-archiver`).

### Path aliases (tsconfig.json)

- `@udonarium/*` → `src/app/class/*`
- `component/*`, `service/*`, `directive/*`, `pipe/*` → corresponding `src/app/*` dirs

## Active work: new SkyWay migration

`docs/new-skyway-migration-plan.md` is the working spec for migrating off the dead legacy SkyWay (CDN-loaded, `webrtc.key`) to the new SkyWay (`skyway2023`), which requires a backend to issue auth tokens. The plan hosts the app on **Netlify + Netlify Functions** (a `/v1/skyway2023/token` endpoint), following upstream v1.17.4's `backend.mode`/`backend.url` approach. A `skyway2023/` connection layer exists under `core/system/network/` but is incomplete; `Network.initializeConnection()` still hardcodes the legacy `skyway/skyway-connection`. Read that doc before touching the network layer.

## Conventions

Prettier (`printWidth: 200`), 2-space indent, single quotes in TS, final newline (`.editorconfig`, `.prettierrc`). Commit messages in this fork use Conventional-Commits-style prefixes, often in Japanese (`feat:`, `fix:`, `docs:`, `build:`, `perf:`).
