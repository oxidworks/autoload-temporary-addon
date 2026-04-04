# Autoload Temporary Firefox Addons (ESM-Update for Firefox 136+)

> Fork of [tsaost/autoload-temporary-addon](https://github.com/tsaost/autoload-temporary-addon) — updated for modern Firefox versions.

## Problem

Firefox does not allow permanently installing unsigned, self-developed extensions. The only way is to load them as "temporary add-ons" via `about:debugging`, but they are lost on every restart.

The [original project](https://github.com/tsaost/autoload-temporary-addon) solved this using Firefox AutoConfig (`userChrome.js`), but stopped working with **Firefox 136+** because Mozilla removed the legacy JSM module system (`Services.jsm`, `AddonManager.jsm`, `FileUtils.jsm`).

## What changed

This fork replaces the old JSM imports with the new ESM equivalents:

```js
// Old (broken in Firefox 136+):
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

// New (works in Firefox 136+):
var Services = globalThis.Services;
var { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
var { FileUtils } = ChromeUtils.importESModule("resource://gre/modules/FileUtils.sys.mjs");
```

Tested on **Firefox 148** (Linux).

## Installation

### Step 1: Copy `config-prefs.js` to Firefox defaults

```bash
# Linux:
sudo cp config-prefs.js /usr/lib/firefox/defaults/pref/

# macOS:
sudo cp config-prefs.js /Applications/Firefox.app/Contents/Resources/defaults/pref/

# Windows (as admin):
copy config-prefs.js "C:\Program Files\Mozilla Firefox\defaults\pref\"
```

### Step 2: Edit `userChrome.js`

Open `userChrome.js` and add your extension paths to `installUnpackedExtensions()`:

```js
function installUnpackedExtensions() {
    installExtension("/home/user/my-extension");
    installExtension("/home/user/another-extension");
}
```

### Step 3: Copy `userChrome.js` to Firefox install directory

```bash
# Linux:
sudo cp userChrome.js /usr/lib/firefox/

# macOS:
sudo cp userChrome.js /Applications/Firefox.app/Contents/Resources/

# Windows (as admin):
copy userChrome.js "C:\Program Files\Mozilla Firefox\"
```

### Step 4: Restart Firefox

Your extensions will be automatically loaded at startup.

## Important

- Your extensions **must** have a `browser_specific_settings` entry in `manifest.json` with a unique `gecko.id`, otherwise local storage will be lost on restart:
  ```json
  "browser_specific_settings": {
    "gecko": { "id": "your-extension@example.com" }
  }
  ```
- This is functionally identical to clicking "Load Temporary Add-on" in `about:debugging` — it just happens automatically.
- The extensions require files in the Firefox install directory (`/usr/lib/firefox/`), which needs admin/root access. This is not a new security concern — if an attacker has write access to that directory, they can already modify `firefox` itself.

## Why is this needed?

Mozilla does not provide a "Developer Mode" like Chrome. The only alternatives are:
- Sign extensions through Mozilla (requires account + internet)
- Use Firefox ESR or Developer Edition (can disable signature checks)
- Load via `about:debugging` every time (lost on restart)

See [Bug 1309288](https://bugzilla.mozilla.org/show_bug.cgi?id=1309288) for the long-standing feature request.

## Credits

- Original project by [tsaost](https://github.com/tsaost/autoload-temporary-addon)
- ESM update by [Mantik IT](https://mantik-it.de)
