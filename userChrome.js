// First line is always a comment
// Autoload temporary Firefox extensions at startup (ESM-compatible, Firefox 136+)
//
// Original: https://github.com/tsaost/autoload-temporary-addon
// Updated for Firefox 136+ ESM modules (Services.jsm/AddonManager.jsm removed)

function reportError(ex) {
	Components.utils.reportError("userChrome.js Ex(" + ex + ")");
}

function printDebug(text) {
	Components.utils.reportError("userChrome.js " + text);
}

async function installExtension(path) {
    let file;

	printDebug("installTemporaryExtension(" + path + ")");
    try {
      file = new FileUtils.File(path);
    } catch (ex) {
		reportError("Expected absolute path: " + ex);
		return;
    }

    if (!file.exists()) {
		reportError("No such file or directory: " + path);
		return;
    }

    try {
		let addon = await AddonManager.installTemporaryAddon(file);
		printDebug("Extension loaded: " + addon.id);
    } catch (ex) {
		reportError("Could not install add-on: " + path + ": " + ex.message);
    }
}


function installUnpackedExtensions() {
	// Add your extensions here (absolute paths):
	// installExtension("/home/user/my-extension");
	// installExtension("/home/user/another-extension");
}


try {
  // Firefox 117+: Services via globalThis
  var Services = globalThis.Services;

  // Firefox 136+: ESM instead of legacy JSM
  var { AddonManager } = ChromeUtils.importESModule(
      "resource://gre/modules/AddonManager.sys.mjs");
  var { FileUtils } = ChromeUtils.importESModule(
      "resource://gre/modules/FileUtils.sys.mjs");

  function ConfigJS() {
	  Services.obs.addObserver(this, 'final-ui-startup', false);
  }

  ConfigJS.prototype = {
	  observe: async function observe(subject, topic, data) {
		  if (topic === 'final-ui-startup') {
			  installUnpackedExtensions();
		  }
	  }
  };

  if (!Services.appinfo.inSafeMode) {
	  new ConfigJS();
  }

} catch(ex) {
	reportError(ex);
};
