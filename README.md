# WebPC App Catalog

The apps WebPC's App Catalog offers. WebPC reads [`catalog.json`](catalog.json)
straight from this repository and installs an app by downloading its `.app` package
from here; the Setup wizard shows what the app may do before it is installed.

**Only what is on `main` is approved.** Every entry points at the package on the main
branch and carries its SHA-256: WebPC lists only entries from here and refuses a
download that is not byte for byte the approved package.

**Branches.** `main` holds only what is published: the catalog and the packages. Each
app's source is a branch named after its id (`app.webpc.paint`), where it is built
into the package that a pull request then brings to `main`.

## Apps

<!-- apps -->
| | App | Version | By | |
|---|---|---|---|---|
| <img src="apps/app.webpc.4x4-evolution/icon.png" width="24" alt=""> | **4x4 Evolution** | 1.0.2 | Terminal Reality | Race off-road trucks across deserts, forests and canyons, earn money to buy and upgrade your rig, and find the shortcuts the track doesn't show. Plays from your own 4x4 Evolution CD. |
| <img src="apps/app.webpc.ares/icon.png" width="24" alt=""> | **Ares** | 1.0.0 | WebPC | Find, download and share files, play your music and videos, and listen to internet radio, all in one classic app with its own skins and languages. |
| <img src="apps/app.webpc.beach-head-2002/icon.png" width="24" alt=""> | **Beach Head 2002** | 1.0.2 | Digital Fusion | Defend the beach from a fixed gun emplacement against waves of tanks, aircraft and landing craft, switching weapons as the assault grows. Plays from your own Beach Head 2002 CD. |
| <img src="apps/app.webpc.checkers/icon.svg" width="24" alt=""> | **Checkers** | 1.0.1 | WebPC | Classic checkers against the computer: move, jump and crown your pieces, offer a draw or resign, and start a new game anytime. |
| <img src="apps/net.lax1dude.eaglercraft/icon.png" width="24" alt=""> | **Eaglercraft 1.8.8** | 1.8.8 | lax1dude | Explore a procedurally generated world with virtually infinite terrain made up of three-dimensional blocks represented as voxels. EaglercraftX 1.8 (WASM-GC build of 10/17/2026). Not affiliated with Mojang or Microsoft. |
| <img src="apps/app.webpc.spreadsheet/icon.svg" width="24" alt=""> | **Excellent Sheet** | 0.1.2 | WebPC | Create and edit spreadsheets with formulas, formatting and multiple sheets, and open or save .xlsx and .csv files. |
| <img src="apps/app.webpc.msgr/icon.png" width="24" alt=""> | **Live Chat Messenger** | 1.0.2 | WebPC | Chat with your friends on WhatsApp from a classic messenger: a contact list, conversations, emoticons, display pictures and notifications. Messages travel directly between this computer and WhatsApp. Unofficial client: WhatsApp may restrict accounts linked to unofficial apps. Not affiliated with WhatsApp or Meta. |
| <img src="apps/app.webpc.mugen/icon.png" width="24" alt=""> | **M.U.G.E.N** | 0.1.3 | WebPC | Fight with your own MUGEN characters and stages in one-on-one battles against the computer or another player, with keyboard or controllers. No game data included; not affiliated with Elecbyte. |
| <img src="apps/app.webpc.player/icon.png" width="24" alt=""> | **Media Player** | 0.1.4 | WebPC | Play music and video, organize your playlists and enjoy your media files with a classic, smooth design. |
| <img src="apps/app.webpc.monster-truck-madness-2/icon.png" width="24" alt=""> | **Monster Truck Madness 2** | 1.0.2 | Terminal Reality | Race monster trucks through circuits, rally courses and drag strips, pull off stunts and crush everything in your way. Plays from your own Monster Truck Madness 2 CD. |
| <img src="apps/org.nodejs.node22/icon.svg" width="24" alt=""> | **Node.js 22** | 22.23.5.2 | Node.js | Shared Node.js runtime for WebPC apps. |
| <img src="apps/app.webpc.paint/icon.svg" width="24" alt=""> | **Paint** | 0.2.1 | WebPC | Draw, paint and edit pictures with brushes, shapes, text and a full color palette, and open or save PNG, JPEG, BMP and GIF images. |
| <img src="apps/app.webpc.pointer/icon.svg" width="24" alt=""> | **Power Pointer** | 0.2.1 | WebPC | Build presentations with text, shapes, pictures and transitions, arrange your slides in Slide Sorter, present them as a slide show, and open or save .pptx files. |
| <img src="apps/app.webpc.code/icon.png" width="24" alt=""> | **Virtual Space Code** | 1.1.2 | WebPC | A full code editor for your projects: edit files and folders, search across them, run commands in the terminal and add extensions. Based on Code - OSS. |
| <img src="apps/app.webpc.webengine/icon.svg" width="24" alt=""> | **Web Engine** | 0.1.7.1 | WebPC | The engine the web browser uses to display pages: WebKit compiled to WebAssembly, based on InceptionJS 0.1.7. Installed and kept up to date by WebPC. |
| <img src="apps/org.webamp.player/icon.png" width="24" alt=""> | **Webamp** | 1.0.0 | Webamp | The classic Winamp 2 player, rebuilt for the web: play your music and internet streams, build playlists, tune the equalizer, change skins and watch Milkdrop visualizations. |
| <img src="apps/app.webpc.words/icon.svg" width="24" alt=""> | **Words Document** | 0.1.1 | WebPC | Write and format documents with fonts, styles, headings, lists and tables, and open or save .docx and .txt files. |
<!-- /apps -->

## Certified and community apps

This repository is the **certified** catalog: every app here was reviewed before it was
merged. Apps anyone may publish, checked only by CI, live in
[ludei-os/community](https://github.com/ludei-os/community); Ludei lists both, marks each
app with its source, and a community app can never use the id of a certified one.
A community app is promoted by moving its entry and packages here under the same id.

## Withdrawing an app

[`blocklist.json`](blocklist.json) lists apps withdrawn from Ludei, from either catalog:
`{ "apps": [ { "id": "...", "versions": ["1.0.0"], "reason": "..." } ] }` (no `versions`
means every version). Ludei reads it at start and every few hours; a withdrawn app no
longer opens or starts its service, and Add or Remove Apps shows the reason. Adding an
entry here is how a malicious or claimed app is taken back from computers that have it.

## Publishing an app

1. Keep the app's source in its own branch here, named after its id. Build the package
   from it (see WebPC's `docs/app-sdk.md`): `scripts/pack-app.sh path/to/app` in the
   WebPC repo makes `build/<id>.app`.
2. Here: `node scripts/publish.mjs path/to/<id>.app`. It checks the manifest (`id`,
   `name`, a `version` newer than the published one, `sdk`, `category`), copies the
   package to `apps/<id>/<id>-<version>.app`, takes out its icon, writes the catalog
   entry from the package's own manifest with its checksum, and updates the list above.
3. `node scripts/verify.mjs` checks that every entry matches its package byte for byte.
   It runs on every pull request too (GitHub Actions).
4. Open a pull request. The maintainer reviews every app and is the only one who
   merges into `main`; once merged, the app is in the App Catalog.

An app's id is a reverse domain of its maker plus its name (`com.example.paint`); an app
is only published under a domain that belongs to whoever makes it.

**Verified publishers** ([`publishers.json`](publishers.json)): the App Catalog shows the
verified badge only on apps whose id is under a verified publisher's domain, and no other
app may use that publisher's name as its author (`verify.mjs`). The list, the scripts and
the apps under `webpc.app` are WebPC's to approve (CODEOWNERS).

`node scripts/publish.mjs --remove <id>` takes an app out.

Earlier versions of a package stay in its folder: a catalog cached for a few minutes
may still point at one.

## Layout

```
catalog.json                    { "apps": [ { id, name, version, description, author,
                                  category, sdk, icon, package, bytes, sha256 } ] }
apps/<id>/<id>-<version>.app   the package
apps/<id>/icon.svg              its icon (or icon.png)
publishers.json                 { "publishers": [ { domain, name, github } ] }
scripts/                        publish.mjs, verify.mjs
```

## Licenses

This repository's own files are under the MIT license ([LICENSE](LICENSE)). Each package
carries its own: Paint is based on [JS Paint](https://github.com/1j01/jspaint) by Isaiah
Odhner (MIT).
