/**
 * @name YTEmbedSuggestion
 * @version 1.0.2
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Replaces irrelevant video recommendations with only displaying videos from the uploader when you pause a Youtube embed video on Discord
 * @source https://github.com/JadeMin/BetterDiscordPlugins/tree/main/YTEmbedSuggestion/
 * @github https://github.com/JadeMin/BetterDiscordPlugins/
 * @github_raw https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js
**/
const fs = require('fs');
const request = require('request');
const electron = require('electron');


const YTEmbedSuggestion = (()=> {
	const config = {
		info: {
			name: "YTEmbedSuggestion",
			authors: [{
				name: "KlartNET",
				github_username: "JadeMin",
				discord_id: "840594543291269120"
			}],
			version: "1.0.2",
			vash: "0.0.0.1",
			description: "Replaces irrelevant video recommendations with only displaying videos from the uploader when you pause a Youtube embed video on Discord",
			github: "https://github.com/JadeMin/BetterDiscordPlugins/",
			github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js"
		},
		changelog: [
			{
				title: "Added:",
				items: [
					"Changelog added.",
					"I edit codes very often, so I added an identification number(vash).\nIf you have any problems or questions, please contact KlartNET#8669."
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
	



	return !global.ZeresPluginLibrary? class {
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
		start(){}
		stop(){}
	}:(([Plugin, Api])=> {
		const plugin = (Plugin, Api)=> {
			const { Toasts, DiscordAPI, Modals, PluginUpdater, Logger } = Api;

			return class YTEmbedSuggestion extends Plugin {
				load() {
					try {
						const versioner = (content)=> {
							let remotes = {};
							const remoteVersion = content.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
							const remoteVash = content.match(/vash\:\s['"]([0-9]\.?){4,}['"]/i);
							
							remotes["version"] = remoteVersion? remoteVersion.toString().replace(/['"]/g, '') : "0.0.0";
							remotes["vash"] = remoteVash? remoteVash[0].replace(/vash\:\s/i, '').replace(/['"]/g, '') : "0.0.0.0";
							return remotes;
						};
						const comparator = (currentVersion, remotes)=> {
							let result;
							if(remotes.vash != config.info.vash){
								result =  true;
							} else {
								if(remotes.version != config.info.version){
									result = true;
								} else result = false;
							}

							//if(result === true)
								Logger.log(`\nCurrent Vash: [${config.info.vash}]\nRemote Vash: [${remotes.vash}]`);
							return result;
						};

						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw, versioner, comparator);
					} catch(error){
						Logger.error(config.info.name, error);
						Toasts.show(`An error occurs while updating the plugin [${config.info.name}]`, {
							type:"error", timeout:5000
						});
					}
				}
				unload(){}



				onStart() {
					//Modals.showChangelogModal("changelog", config.info.version, config.changelog, `vash: ${config.info.vash}`);
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
							Logger.log("in Observer", {iframeElement});
							iframeElement.src += "&rel=0";
						}
					}
				}
			};
		};


		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
