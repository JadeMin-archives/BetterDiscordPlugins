/**
 * @name YTEmbedSuggestion
 * @version 0.1.0
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Replaces irrelevant video recommendations that appear when playing a YouTube embedded video on Discord. _**(You can't remove "More Videos" itself with this plugin.)**_
 * @source https://github.com/JadeMin/BetterDiscordAddons/tree/YTEmbedSuggestion/Plugins/YTEmbedSuggestion
 **/



//const fs = require('fs');
const config = {
	info: {
		name: "YTEmbedSuggestion",
		authors: [
			{
				name: "KlartNET",
				github_username: "JadeMin",
				discord_id: "840594543291269120"
			},
		],
		version: "1.0.0",
		description: "Replaces irrelevant video recommendations that appear when playing a YouTube embedded video on Discord. _**(You can't remove \"More Videos\" itself with this plugin.)**_",
		updateUrl: "https://raw.githubusercontent.com/JadeMin/BetterDiscordAddons/YTEmbedSuggestion/Plugins/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js"
	}
};
const settings = {
	"logger": {
		id: "logger",
		title: "Developer Logger",
		description: "Leaves the main log. Do not activate this without good reason! It causes performance degradation. (default: false)",
		value: false
	}
};



module.exports = !global.ZeresPluginLibrary ? class {
	constructor(){ this._config = config; }

	load() {
		BdApi.showConfirmationModal("Library plugin is needed", `ZeresPluginLibrary is missing. Please click Download Now to install it.`, {
			confirmText: "Download",
			cancelText: "Cancel",
			onConfirm: ()=> {
				request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
					if(error) return electron.shell.openExternal("https://github.com/rauenzi/BDPluginLibrary");

					fs.writeFileSync(path.join(BdApi.Plugins.folder, "YTEmbedSuggestion.plugin.js"), body);
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

				/*//PluginUtilities.loadData("HideStreamPreview");
				const configs = JSON.parse(fs.readFileSync(`${__dirname}/${this.getName()}.config.json`, 'utf8'));
				Object.entries(configs).forEach((setting, index)=> {
					settings[setting[1].id].value = setting[1].value;
				});*/
			} catch(error){
				console.error(error);
			}
		}
		unload(){}

		/*getSettingsPanel() {
			try {
				const panel = new Settings.SettingPanel();
				Object.entries(settings).forEach((setting, index)=> {
					panel.append(
						new Settings.Switch(
							setting[1].title, setting[1].description, setting[1].value,
							(afterValue)=> {
								settings[setting[1].id].value = afterValue[1].value;
								PluginUtilities.saveSettings(`${this.getName()}`, {}[setting[1].id] = afterValue[1].value);
							}
						)
					);
				});

				return panel.getElement();
			} catch(error){
				console.error(error);
			}
		}*/



		onStart() {
			document.querySelectorAll("div[class^='embedVideo-']").forEach(element=> {
				this.appendRel(element.lastChild);
			});
		}
		onStop(){}


		observer(element) {
			const target = element.target;
			if(/^(embedVideo\-[a-z0-9]+)\s(embedMedia-[a-z0-9]+)$/i.test(target.className)) {
				this.appendRel(target.lastChild);
			}
		}
		appendRel(iframeElement){
			if( !(iframeElement instanceof HTMLIFrameElement) ) {
				//console.error(`[Observer in ${config.info.name}] iframe is not an instance of HTMLIFrameElement.`, iframe);
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
