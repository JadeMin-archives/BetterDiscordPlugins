/**
 * @name YTEmbedSuggestion
 * @website https://github.com/JadeMin/BetterDiscordPlugins/
 * @source https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js
**/
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
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

module.exports = (()=> {
	const fs = require('fs');
	const request = require('request');
	const Electron = require('electron');
	const Path = require('path');

	
	const config = {
		info: {
			name: "YTEmbedSuggestion",
			authors: [{
				name: "KlartNET",
				github_username: "JadeMin"
			}],
			version: "1.0.30020",
			//vash: "0.0.0.2",
			description: "Replaces irrelevant video recommendations with only displaying videos from the uploader when you pause a Youtube embed video on Discord",
			github: "https://github.com/JadeMin/BetterDiscordPlugins/",
			github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js"
		},
		changelog: [
			{
				title: "Progress:",
				type: "progress",
				items: [
					"Plugin performance sightly improved. (not yet finished)"
				]
			}
		],
		defaultConfig: [
			{
				type: "category",
				name: "Devoloper",
				id: "dev",
				settings: [
					{
						type: "switch",
						id: "logger",
						name: "Developer Logger",
						note: "Leaves the main log. Do not activate this without good reason! It may causes performance degradation. (default: false)",
						value: false
					},
					{
						type: "textbox",
						id: "changeVersion",
						name: "CHANGEVERSION",
						note: "Do not change this without good reason",
						value: "0"
					}
				],
			}
		]
	};
	



	return !global.ZeresPluginLibrary? class {
		constructor(){ this._config = config; }
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }
		
		load() {
			BdApi.showConfirmationModal(
				"The library plugin is needed",
				[`The library plugin needed for **${config.info.name}** is missing! Please click "Download" to install it.`], {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: ()=> {
					const libraryUrl = "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js";
					request.get(libraryUrl, async (error, response, body)=> {
						if(error) return Electron.shell.openExternal(libraryUrl);
						
						await new Promise(resolve=> {
							fs.writeFile(Path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, resolve);
						});
					});
				}
			});
		}
		start(){}
		stop(){}
	} : (([Plugin, Library])=> {
		const plugin = (Plugin, Library)=> {
			const { PluginUtilities, Toasts, Modals, PluginUpdater, Logger } = Library;
			const settings = PluginUtilities.loadSettings(config.info.name);

			return class YTEmbedSuggestion extends Plugin {
				constructor(){ super(); }
				showChangelogModal(legacy=false){
					if(legacy) {
						const setting = {
							"dev": {
								"changeVersion": config.info.version
							}
						};
						PluginUtilities.saveSettings(config.info.name, setting);
					}

					return Modals.showChangelogModal("changelog", config.info.version, config.changelog);
				}
				getSettings() {
					return PluginUtilities.loadSettings(config.info.name);
				}

				
				load() {
					// Shows changelog
					try {
						if(Object.keys(this.getSettings()).length) {
							if(this.getSettings().dev.logger) {
								Logger.log(config.info.name, this.getSettings());
								Logger.log(config.info.name, config.info.version);
							}

							if(this.getSettings().dev.changeVersion != config.info.version) {
								this.showChangelogModal(false);

								const _settings = this.getSettings();
								_settings.dev.changeVersion = config.info.version;
								PluginUtilities.saveSettings(config.info.name, _settings);
							}
						} else this.showChangelogModal(true);
					} catch(error){
						Logger.error(config.info.name, error);
						Toasts.show(`An error occurs while showing up the changelog. [${config.info.name}]`, {
							type:"error"
						});
					}


					// Check updates for the plugin
					try {
						/*const versioner = (content)=> {
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
								result = true;
							} else {
								if(remotes.version != config.info.version){
									result = true;
								} else result = false;
							}

							if(this.settings.dev.logger) Logger.log(`\nCurrent Vash: [${config.info.vash}]\nRemote Vash: [${remotes.vash}]`);
							return result;
						};

						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw, versioner, comparator);*/

						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw);
					} catch(error){
						Logger.error(config.info.name, error);
						Toasts.show(`An error occurred while updating the plugin [${config.info.name}]`, {
							type:"error", timeout:5000
						});
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
				onStop() {}

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
						
						if(this.getSettings()?.dev?.logger) {
							Logger.log("in Observer", {iframeElement, identifier});
						}
						iframeElement.src += "&rel=0";
					}
				}


				getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}
			};
		};


		return plugin(Plugin, Library);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
