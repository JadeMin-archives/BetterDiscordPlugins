/**
 * @name NitroBypass
 * @version 1.0.60000
 * @invite fm3dW2enWt
 * @source https://github.com/JadeMin/BetterDiscordPlugins/blob/main/NitroBypass/NitroBypass.plugin.js
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
	const config = {
		info: {
			name: "NitroBypass",
			authors: [{
				name: "JadeMin"
			}],
			version: "1.0.60000",
			description: "고해상도의 방송(라이브) 송출과 이모티콘을 니트로 없이 사용하세요! (스티커는 아직 지원하지 않습니다)",
			github: "https://github.com/JadeMin/BetterDiscordPlugins/",
			github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/NitroBypass/NitroBypass.plugin.js"
		},
		changelog: [
			/*{
				title: "새 기능:",
				type: "added",
				items: [
					"**Google Analytics 시스템을 추가했습니다**",
					"이 플러그인을 활성화함으로써 개발자가 오류 발생 기록을 수집하는 것에 동의의하는 것으로 간주됩니다.",
					"_위 정보수집약관 동의를 거부하려는 경우 플러그인을 비활성화 또는 삭제해주세요._"
				]
			},*/
			{
				title: "핫픽스:",
				type: "fixed",
				items: [
					"__**디스코드 및 베터디스코드 업데이트 대응**__",
					"플러그인이 작동하지 않는 문제를 해결했습니다. 마참내!\n_만약 여전히 작동하지 않는다면 디스코드를 재시작해 업데이트를 진행해주세요._",
				]
			},
			{
				title: "진행중:",
				type: "progress",
				items: [
					"플러그인 성능 개선 작업이 진행중입니다."
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
	



	if(!global.ZeresPluginLibrary) {
		return class FakeBDPlugin {
			constructor(){ this._config = config; }
			getName() { return config.info.name; }
			getAuthor() { return config.info.authors.map(a=> a.name).join(', '); }
			getDescription() { return config.info.description; }
			getVersion() { return config.info.version; }
			load() {
				BdApi.showConfirmationModal(
					"라이브러리 플러그인 설치가 필요합니다.",
					[`\`\`**${config.info.name}**\`\` 플러그인 실행에 필요한 라이브러리 플러그인이 없습니다. "다운로드"를 눌러 라이브러리 플러그인을 다운로드하세요!`], {
					confirmText: "다운로드",
					cancelText: "취소",
					onConfirm: ()=> {
						const libraryUrl = new URL("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js");
						const libraryPaths = libraryUrl.pathname.split("/");
						
						request.get(libraryUrl.href, async (error, _response, body) => {
							if(error) return Electron.shell.openExternal(libraryUrl.href);
							
							await new Promise(resolve=> {
								fs.writeFile(`${BdApi.Plugins.folder}\\${libraryPaths[libraryPaths.length-1]}`, body, resolve);
							});
						});
					}
				});
			}
			start(){}
			stop(){}
		};
	} else {
		return (([Plugin, Library]) => {
			const {
				DiscordModules, Patcher,
				PluginUtilities,
				PluginUpdater,
				Logger, Toasts, Modals
			} = Library;
            
            
			return class NitroBypass extends Plugin {
				constructor(){ super(); }
				getSettings() {
					return PluginUtilities.loadSettings(config.info.name);
				}
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
				initAnalytics() {
					const properties = {
						gtag: {
							className: `gtag-${config.info.name}`,
							trackingId: 'UA-143612368-4'
						},
						gtm: {
							className: `gtm-${config.info.name}`,
							id: 'GTM-KJR5P8Q'
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
				}

				
				setPremiumType(type) {
					if(!this.hasOwnProperty("_premiumType")) {
						this._premiumType = DiscordModules.UserStore.getCurrentUser().premiumType;
					}

					return DiscordModules.UserStore.getCurrentUser().premiumType = type;
				}
				setEmojiBypass() {
					const MessageActions = DiscordModules.MessageActions;

					return !this._premiumType? [
						Patcher.before(MessageActions, "sendMessage", (_thisObject, args) => {
							const [_channelId, message] = args;
							const validNonShortcutEmojis = message.validNonShortcutEmojis;

							if(validNonShortcutEmojis) {
								validNonShortcutEmojis.forEach(emoji=> {
									if(emoji.url.startsWith("/assets/")) return;
									const emojiName = emoji.allNamesString.replace(/~\d/g, "");
									const emojiFullDir = `<${emoji.animated? "a":''}${emojiName}${emoji.id}>`;

									message.content = message.content.replace(emojiFullDir, emoji.url+`&size=${48}`);
								});
							}
							return args;
						}),
						Patcher.before(MessageActions, "editMessage", (_thisObject, args) => {
							const [_guildId, _channelId, message] = args;
							const rawEmojiStrings = message.content.match(/<(a)?:(.*)?:\d{18}>/g);

							if(rawEmojiStrings) {
								rawEmojiStrings.forEach(rawEmojiString=> {
									const emojiUrl = `https://cdn.discordapp.com/emojis/${rawEmojiString.match(/\d{18}/g)[0]}?size=${48}`;
									message.content = message.content.replace(rawEmojiString, emojiUrl);
								});
							}
							return args;
						})
					]:[];
				}

				load() {
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
				}
				unload(){}
				onStart() {
					this.initAnalytics();
					
					
					this.setPremiumType(2);
					this.patches = this.setEmojiBypass();
				}
				onStop() {
					this.setPremiumType(this._premiumType);
					this.patches.forEach(unpatch=> unpatch?.());
				}
				onSwitch() {
					if(this.getSettings()?.dev?.logger) {
						Logger.log(this._premiumType);
					}
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
			};
		})(global.ZeresPluginLibrary.buildPlugin(config));
	}
})();
/*@end@*/
