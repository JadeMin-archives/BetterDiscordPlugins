/**
 * @name YTEmbedSuggestion
 * @version 1.0.1
 * @vash 1.0.0.0
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
		vash: "1.0.0.0",
		description: "When you pause a Youtube embed video on Discord, replaces irrelevant video recommendations with only displaying videos from the uploader.",
		updateUrl: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js"
	},
	changelog: [
		{
			title: "Added:",
			items: [
				"Changelog added."
			]
		},
		{
			title: "Progress:",
			type: "progress",
			items: [
				"Plugin performance improved. (not yet finished)"
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
	const { Toasts, DiscordAPI, Modals, PluginUpdater, Logger } = Api;
	window.PluginUpdater = PluginUpdater;

	return class YTEmbedSuggestion extends Plugin {
		load() {
			try {
				const versioner = (content)=> {
					const remoteVash = content.match(/@vash\s([0-9]\.?){4,}/i);
					alert(remoteVash? remoteVash[0].split(' ')[1]:"1.0.0.0");
					return remoteVash? remoteVash[0].split(' ')[1]:"1.0.0.0";
				};
				const comparator = (currentVash, remoteVash)=> { 
					return remoteVash != config.info.vash;
				};

				PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.updateUrl, versioner, comparator);
			} catch(error){
				Toasts.show(`An error occurs while updating the plugin [${config.info.name}]`, {
					type:"error", timeout:5000
				});
				Logger.error(config.info.name, error);
			}
			
			Modals.showChangelogModal("Changelog", config.info.version, config.changelog, `Vash: ${config.info.vash}`);
		}
		unload(){}



		onStart() {
			//Logger.info(`The user's locale: [${DiscordAPI.UserSettings.locale}]`);
			
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
