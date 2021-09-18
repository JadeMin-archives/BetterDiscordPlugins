/**
 * @name YTEmbedSuggestion
 * @version 1.0.1
 * @author KlartNET
 * @authorId 840594543291269120
 * @description When you pause a Youtube embed video on Discord, replaces irrelevant video recommendations with only displaying videos from the uploader.
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
		version: "1.0.1",
		description: "When you pause a Youtube embed video on Discord, replaces irrelevant video recommendations with only displaying videos from the uploader.",
		updateUrl: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js"
	},
	changelog: [
		{
			title: "Added:",
			items: [
				"Changelog added"
			]
		},
		{
			title: "Fixed:",
			type: "improved",
			items: [
				"Plugin improvements (not yet finished)"
			]
		}
	]
};
/*const settings = {
	"logger": {
		title: "Developer Logger",
		description: "Leaves the main log. Do not activate this without good reason! It may causes performance degradation. (default: false)",
		value: false
	}
};*/



module.exports = !global.ZeresPluginLibrary? class {
	constructor(){ this._config = config; }

	load() {
		BdApi.showConfirmationModal(
			"The library plugin is needed",
			[`The library plugin needed for **${config.info.name}** is missing! Please click \"Download" to install it.`], {
			confirmText: "Download",
			cancelText: "Cancel",
			onConfirm: ()=> {
				const libraryUrl = "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js";
				request.get(libraryUrl, async (error, response, body)=> {
					if(error) return electron.shell.openExternal(libraryUrl);
					
					await new Promise(resolve=> {
						fs.writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, resolve);
					});
				});
			}
		});
	}
	start() {}
	stop() {}
}:(([Plugin, Api])=> {
	const { Modals, PluginUpdater, Logger } = Api;

	return class YTEmbedSuggestion extends Plugin {
		load() {
			try {
				PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.updateUrl);
			} catch(error){
				Logger.error(config.info.name, error);
			}
			
			Modals.showChangelogModal("Changelog", config.info.version, config.changelog);
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
			if( !(iframeElement instanceof HTMLIFrameElement) ) return;
			
			if(iframeElement.src.startsWith("https://www.youtube.com/embed/")) {
				const identifier = !~iframeElement.src.indexOf("&rel=0");

				if(identifier) {
					Logger.log(config.info.name, "in Observer", {iframeElement});
					iframeElement.src += "&rel=0";
				}
			}
		}
	};
})(global.ZeresPluginLibrary.buildPlugin(config));
