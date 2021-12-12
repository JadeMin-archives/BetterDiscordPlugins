/**
 * @name ReportMessages
 * @website https://github.com/JadeMin/BetterDiscordPlugins/
 * @source https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/ReportMessage/ReportMessage.plugin.js
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
			name: "ReportMessages",
			authors: [{
				name: "KlartNET",
				github_username: "JadeMin"
			}],
			version: "1.0.10002",
			//vash: "0.0.0.2",
			description: "디스코드 공식 기능인 메시지 신고 기능을 활성화해줍니다.",
			github: "https://github.com/JadeMin/BetterDiscordPlugins/",
			github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/ReportMessages/ReportMessages.plugin.js"
		}
	};
	



	return !global.ZeresPluginLibrary? class {
		constructor(){ this._config = config; }
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }
		
		load() {
			BdApi.showConfirmationModal(
				"라이브러리 플러그인 설치가 필요합니다.",
				[`\`\`**${config.info.name}**\`\` 플러그인 실행에 필요한 라이브러리 플러그인이 없습니다. "다운로드"를 눌러 라이브러리 플러그인을 다운로드하세요!`], {
				confirmText: "다운로드",
				cancelText: "취소",
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
			const {
				WebpackModules, Patcher,
				PluginUpdater,
				Toasts, Logger
			} = Library;


			return class ReportMessages extends Plugin {
				constructor(){ super(); }



				load() {
					// Check updates
					try {
						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw);
					} catch(error){
						Logger.error(config.info.name, error);
						Toasts.show(`플러그인의 업데이트를 확인하는도중 오류가 발생했습니다. [${config.info.name}]`, {
							type:"error", timeout:5000
						});
					}
				}
				unload(){}


				onStart(){
					const MiniPopover = WebpackModules.getModule(module=> module?.default?.displayName === "MiniPopover");

					Patcher.after(MiniPopover, "default", (_thisObject, args)=> {
						const child = args[0].children.filter(element=> element?.hasOwnProperty("props"));
						if(child.length) child[0].props.canReport = true;
					});
				}
				onStop(){
					Patcher.unpatchAll();
				}


				/*getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}*/
			};
		};


		return plugin(Plugin, Library);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
