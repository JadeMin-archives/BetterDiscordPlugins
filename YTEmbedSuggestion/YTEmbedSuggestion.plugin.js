/**
 * @name YTEmbedSuggestion
 * @version 1.0.2
 * @author KlartNET
 * @authorId 840594543291269120
 * @description When you pause a Youtube embed video on Discord, replaces irrelevant video recommendations with only displaying videos from the uploader.
 * @source https://github.com/JadeMin/BetterDiscordPlugins/tree/main/YTEmbedSuggestion/
 * @github https://github.com/JadeMin/BetterDiscordPlugins/
 * @github_raw https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js
**/

/*@cc_on
@if (@_jscript)
		// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	
		// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
			// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/
const fs = require('fs');
const request = require('request');
const electron = require('electron');


var YTEmbedSuggestion = (()=> {
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
			description: "When you pause a Youtube embed video on Discord, replaces irrelevant video recommendations with only displaying videos from the uploader.",
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

							if(result === true) {
								Logger.log(`\nCurrent Vash: [${config.info.vash}]\nRemote Vash: [${remotes.vash}]`);
							}
							return result;
						};

						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw, versioner, comparator);
					} catch(error){
						Toasts.show(`An error occurs while updating the plugin [${config.info.name}]`, {
							type:"error", timeout:5000
						});
						Logger.error(config.info.name, error);
					}
				}
				unload(){}



				onStart() {
					//Modals.showChangelogModal("changelog", config.info.version, config.changelog);
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
/*@end@*/
