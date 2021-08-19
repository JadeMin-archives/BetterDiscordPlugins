/**
 * @name YTEmbedSuggestion
 * @version 1.0.0
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Replaces the irrelevant video recommendations that when you pause the YouTube Embedded video on Discord. _**(You can't remove the "More Videos" itself with this plugin!)**_
 * @source https://github.com/JadeMin/BetterDiscordPlugins/tree/main/YTEmbedSuggestion/
 * @updateUrl https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js
 **/

const fs = require('fs');
const request = require('request');
const electron = require('electron');

const config = {
	info: {
		name: "YTEmbedSuggestion",
		authors: [{
			name: "KlartNET",
			github_username: "JadeMin",
			discord_id: "840594543291269120"
		}],
		version: "1.0.0",
		description: "Replaces the irrelevant video recommendations that when you pause the YouTube Embedded video on Discord. _**(You can't remove the \"More Videos\" itself with this plugin!)**_",
		updateUrl: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js"
	}
};
const settings = {
	"logger": {
		title: "Developer Logger",
		description: "Leaves the main log. Do not activate this without good reason! It may causes performance degradation. (default: false)",
		value: false
	}
};



module.exports = !global.ZeresPluginLibrary ? class {
	constructor(){ this._config = config; }

	load() {
		BdApi.showConfirmationModal(
			"The library plugin is needed",
			[`The library plugin needed for **${config.info.name}** is missing! Please click \"Download" to install it.`], {
			confirmText: "Download",
			cancelText: "Cancel",
			onConfirm: ()=> {
				request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body)=> {
					if(error) return electron.shell.openExternal("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js");
					await new Promise(resolve=> fs.writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, resolve));
				});
			}
		});
	}
	start() {}
	stop() {}
}:(([Plugin, Api])=> {
	const { Settings, PluginUpdater, PluginUtilities } = Api;

	return class YTEmbedSuggestion extends Plugin {
		load() {
			try {
				PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.updateUrl);
			} catch(error){
				console.error(error);
			}
		}
		unload(){}



		onStart() {
			document.querySelectorAll("div[class^='embedVideo-']").forEach(element=> {
				this.appendRel(element.lastChild);
			});
		}
		onStop(){}

		observer(element) {
			const target = element.target;
			if(/^(embedVideo\-[a-z0-9]+)\s(embedMedia\-[a-z0-9]+)$/i.test(target.className)) {
				this.appendRel(target.lastChild);
			}
		}
		appendRel(iframeElement){
			if( !(iframeElement instanceof HTMLIFrameElement) ) {
				console.error(`[Observer in ${config.info.name}] iframe is not an instance of HTMLIFrameElement.`, iframe);
			} else {
				if(iframeElement.src.startsWith("https://www.youtube.com/embed/")) {
					const identifier = !~iframeElement.src.indexOf("&rel=0");

					if(identifier) iframeElement.src += "&rel=0";
					console.log(`[Observer in ${config.info.name}]`, {iframeElement, identifier});
				}
			}
		}
	};
})(global.ZeresPluginLibrary.buildPlugin(config));
