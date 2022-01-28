/**
 * @name ReportMessages
 * @source https://github.com/JadeMin/BetterDiscordPlugins/blob/main/ReportMessages/ReportMessages.plugin.js
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
	
	if(fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if(!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if(shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
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
			version: "1.0.20019",
			//vash: "0.0.0.2",
			description: "숨겨진 디스코드 공식 기능인 ``메시지 신고 기능``을 활성화합니다.",
			github: "https://github.com/JadeMin/BetterDiscordPlugins/",
			github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/ReportMessages/ReportMessages.plugin.js"
		},
		changelog: [
			/*{
				title: "새 기능:",
				type: "added",
				items: [
					"**Google Analytics 시스템을 추가했습니다**",
					"이 플러그인을 활성화함으로써 개발자가 오류 발생 기록을 수집하는 것에 동의의하는 것으로 간주됩니다.",
					"_위 정보수집약관 동의를 거부하려는 경우 플러그인을 비활성화 또는 삭제해주세요. 그 이후로 어떠한 정보도 수집되지 않습니다._"
				]
			},*/
			{
				title: "수정:",
				type: "fix",
				items: [
					"플러그인 종료 시 플러그인 기능과 관련된 모든 패치가 언패치되지 않은채로 작동해 메모리 낭비가 발생하는 문제를 해결했습니다."
				]
			},
			{
				title: "진행중:",
				type: "progress",
				items: [
					"특정 종류의 사용자가 보낸 메시지에만 신고 버튼을 활성화하는 옵션을 추가중입니다.",
					"플러그인 성능 개선 작업이 진행중입니다."
				]
			}
		],
		defaultConfig: [
			{
				type: "category",
				name: "개발자 도구",
				id: "dev",
				settings: [
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
				DiscordModules, WebpackModules, Patcher,
				PluginUtilities,
				PluginUpdater,
				Logger, Toasts, Modals
			} = Library;


			return class ReportMessages extends Plugin {
				constructor(){
					super();
				};
				
				getSettings() {
					return PluginUtilities.loadSettings(config.info.name);
				};
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
				};
				initAnalytics() {
					const properties = {
						gtag: {
							className: `gtag-${config.info.name}`,
							trackingId: "UA-143612368-4"
						},
						gtm: {
							className: `gtm-${config.info.name}`,
							id: "GTM-KJR5P8Q"
						}
					};

					(function(){
						const gtagScript = document.createElement('script'),
							script = document.createElement('script'),
							GTMScript = document.createElement('script');
						
						
						gtagScript.async = true;
						gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${properties.gtag.trackingId}`;
						gtagScript.className = properties.gtag.className;

						script.className = properties.gtag.className;
						script.innerHTML = `
							window.dataLayer = window.dataLayer || [];
							function gtag(){ dataLayer.push(arguments); }
							gtag('js', new Date());
							gtag('config', "${properties.gtag.trackingId}");
						`;

						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'gtm.start': new Date().getTime(),
							event: 'gtm.js'
						});
						GTMScript.async = true;
						GTMScript.src = `https://www.googletagmanager.com/gtm.js?id=${properties.gtm.id}`;
						GTMScript.className = properties.gtm.className;


						document.querySelectorAll(`.${properties.gtag.className}`).forEach(element=> element.remove());
						document.querySelectorAll(`.${properties.gtm.className}`).forEach(element=> element.remove());
						document.head.appendChild(gtagScript);
						document.head.appendChild(script);
						document.head.appendChild(GTMScript);
					})();
				};
				

				
				load() {
					this.currentUser = ()=> DiscordModules.UserStore.getCurrentUser();
					
					// Shows changelog
					try {
						if(Object.keys(this.getSettings()).length) {
							if(this.getSettings().dev.logger) {
								Logger.log(this.getSettings());
								Logger.log(config.info.version);
							}

							if(this.getSettings().dev.changeVersion != config.info.version) {
								this.showChangelogModal(false);

								const _settings = this.getSettings();
								_settings.dev.changeVersion = config.info.version;
								PluginUtilities.saveSettings(config.info.name, _settings);
							}
						} else this.showChangelogModal(true);
					} catch(error){
						Logger.error(error);
						Toasts.show(`업데이트 내역 창을 띄우는 도중 오류가 발생했습니다. [${config.info.name}]`, {
							type:"error"
						});
					}
					
					
					// Check updates
					try {
						PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw);
					} catch(error){
						Logger.error(error);
						Toasts.show(`플러그인의 업데이트를 확인하는 도중 오류가 발생했습니다. [${config.info.name}]`, {
							type:"error", timeout:5000
						});
					}
				};
				unload(){};


				onStart() {
					this.initAnalytics();


					const MiniPopover = WebpackModules.getModule(module=> module?.default?.displayName === "MiniPopover");
					//const MenuItem = WebpackModules.getModule(module=> module?.default?.displayName === "MenuItem");
					
					this.patches = [
						Patcher.after(MiniPopover, 'default', (_thisObject, args)=> {
							const children = args[0].children.filter(element=> element?.hasOwnProperty("props"));

							if(children.length) {
								const props = children[0].props;

								if(props?.message?.author?.id !== this.currentUser().id) {
									props.canReport = true;
								}
							}
						}),
						/*
						Patcher.after(MenuItem, 'default', (_thisObject, args)=> {
							const menuItem = args[0];

							if(menuItem.id == 'tts') {
								document.getElementById(menuItem?.menuItemProps?.id)?.setAttribute('style', "display: none;");
							}
							if(menuItem.id == 'mark-unread') {
								document.getElementById(menuItem?.menuItemProps?.id)?.setAttribute('style', "display: none;");
							}
						});
						*/
					];
				};
				onStop() {
					this.patches?.forEach(unpatch=> unpatch());
				};

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
