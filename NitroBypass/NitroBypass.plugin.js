/**
 * @name NitroBypass
 * @authorId 000000000000000000
 * @website https://github.com/JadeMin/BetterDiscordPlugins/
 * @source https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/NitroBypass/NitroBypass.plugin.js
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
			name: "NitroBypass",
			authors: [{
				/*name: "",
				discord_id: "000000000000000000",*/
				github_username: "JadeMin"
			}],
			version: "1.0.40009",
			description: "고해상도의 방송 송출을 니트로 없이 사용하세요!",
			github: "https://github.com/JadeMin/BetterDiscordPlugins/",
			github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/NitroBypass/NitroBypass.plugin.js"
		},
		changelog: [
			{
				title: "수정:",
				type: "added",
				items: [
					"**Google Analytics 시스템을 추가했습니다**",
					"이 플러그인을 활성화함으로써 개발자가 오류 발생 기록을 수집하는 것에 동의의하는 것으로 간주됩니다.",
					"_위 정보수집약관 동의를 거부하려는 경우 플러그인을 비활성화 또는 삭제해주세요. 그 이후로 어떠한 정보도 수집되지 않습니다._"
				]
			},
			{
				title: "진행중:",
				type: "progress",
				items: [
					"플러그인 내장 기능으로 ``니트로 이모티콘 우회`` 기능을 추가할 예정입니다.",
					"플러그인 성능 개선 작업이 진행중입니다. (미완성)"
				]
			}
		],
		defaultConfig: [
			/*{
				type: "category",
				name: "일반",
				id: "general",
				settings: [
					{
						type: "button",
						id: "showChangelog",
						name: "업데이트 내역 보기",
						note: "업데이트 내역을 다시 확인할 수 있습니다.",
						value: "0"
					}
				]
			},*/
			{
				type: "category",
				name: "개발자 도구",
				id: "dev",
				settings: [
					{
						type: "switch",
						id: "logger",
						name: "개발자 로그",
						note: "개발자 로그를 남깁니다. 이 옵션을 정당한 이유 없이 활성화하지 마세요! 일부 기기에서는 성능 저하가 발생할 수 있습니다. (기본값: 꺼짐)",
						value: false
					},
					{
						type: "textbox",
						id: "changeVersion",
						name: "CHANGEVERSION",
						note: "업데이트 내역(Changelog)이 확인됐음을 보관하는 시스템 변수입니다. 값 변경을 권장하지 않습니다.",
						value: "0"
					}
				]
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
				DiscordAPI,
				PluginUtilities,
				PluginUpdater,
				Modals, Toasts, Logger
			} = Library;
			

			return class NitroBypass extends Plugin {
				constructor(){ super(); }
				showChangelogModal(legacy=false) {
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
				initAnalytics(){
					(function(){
						const gtagScript = document.createElement('script');
						gtagScript.async = true;
						gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=UA-143612368-4";
						gtagScript.id = "gtag";
						gtagScript.onload = ()=> {
							window.dataLayer = window.dataLayer || [];
							const properties = {
								gtag: 'UA-143612368-4',
								gtm: 'GTM-KJR5P8Q'
							};
							const gtag = (...args)=> dataLayer.push(...args);


							(function GTAG(){
								gtag('js', new Date());
								gtag('config', properties.gtag);
							})();

							(function GTM(){
								gtag({
									"gtm.start": new Date().getTime(),
									event: 'gtm.js'
								});
								const GTMScript = document.createElement('script');
								GTMScript.async = true;
								GTMScript.src = `https://www.googletagmanager.com/gtm.js?id=${properties.gtm}&l=dataLayer`;
								GTMScript.id = "gtm";
								
								
								document.getElementById("gtm")?.remove();
								document.head.appendChild(GTMScript);
							})();
						};


						document.getElementById("gtag")?.remove();
						document.head.appendChild(gtagScript);
					}());
				}

				
				
				load() {
					this._premiumType = DiscordAPI.currentUser.discordObject.premiumType;

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
						Toasts.show(`업데이트 내역 창을 띄우는 도중 오류가 발생했습니다. [${config.info.name}]`, {
							type:"error"
						});
					}


					// Check updates
					try {
						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw);
					} catch(error){
						Logger.error(config.info.name, error);
						Toasts.show(`플러그인의 업데이트를 확인하는 도중 오류가 발생했습니다. [${config.info.name}]`, {
							type:"error", timeout:5000
						});
					}
				}
				unload(){}
				
				
				onStart() {
					this.initAnalytics();
					
					DiscordAPI.currentUser.discordObject.premiumType = 2;
				}
				onStop() {
					DiscordAPI.currentUser.discordObject.premiumType = this._premiumType;
				}
				onSwitch() {
					if(this.getSettings()?.dev?.logger) {
						Logger.log(config.info.name, DiscordAPI);
						Logger.log(config.info.name, DiscordAPI.currentUser);
						Logger.log(config.info.name, DiscordAPI.currentUser.discordObject);
						Logger.log(config.info.name, DiscordAPI.currentUser.discordObject.premiumType);
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
