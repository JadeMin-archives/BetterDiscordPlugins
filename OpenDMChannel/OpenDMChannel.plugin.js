/**
 * @name OpenDMChannel
 * @source https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/OpenDMChannel/OpenDMChannel.plugin.js
**/
const config = {
	info: {
		name: "OpenDMChannel",
		authors: [{
			name: "KlartNET",
			github_username: "JadeMin",
			discord_id: "840594543291269120"
		}],
		version: "1.0.4",
		description: "Open a DM channel for the specific user.",
		github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/OpenDMChannel/OpenDMChannel.plugin.js"
	}
};



module.exports = !global.ZeresPluginLibrary? class {
	constructor(){ this._config = config; }

	load() {
		BdApi.showConfirmationModal(
			"The library plugin is needed",
			[`The library plugin needed for **${config.info.name}** is missing! Please click "Download" to install it.`], {
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
	const {
		WebpackModules, DiscordModules,
		PluginUpdater,
		Logger, Toasts,
	} = Api;

	return class OpenDmChannel extends Plugin {
		async load() {
			try {
				await PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), config.info.github_raw);
			} catch(error){
				Logger.error(error);
				Toasts.show(`An error occurred while updating the plugin. [${config.info.name}]`, {
					type:"error", timeout:5000
				});
			}
			
			//Modals.showChangelogModal("Changelog", config.info.version, config.changelog);
		};
		unload(){};



		onStart() {
			const { BUILT_IN_COMMANDS, BUILT_IN_SECTIONS } = WebpackModules.getByProps("BUILT_IN_COMMANDS");
			const sendBotMessage = (channelId, content, embed, DiscordAnalyticsSentry=null)=> {
				return DiscordModules.MessageActions.sendBotMessage(channelId || DiscordModules.SelectedChannelStore.getChannelId(), content, embed, DiscordAnalyticsSentry);
			};

			
			BUILT_IN_SECTIONS["KlartNET"] = {
				get name(){
					return "KlartNET Plugins";
				}
			};
			BUILT_IN_COMMANDS.push({
				applicationId: "KlartNET",
				execute: async (args, {guild, channel}) => {
					const argumentUser = args.find(arg=> arg.name == "UserID");
					if(argumentUser) {
						const userId = argumentUser.value;
						const targetUser = DiscordModules.UserStore.getUser(userId);

						if(targetUser) {
							try {
								await WebpackModules.getByProps("openPrivateChannel").openPrivateChannel(userId);

								sendBotMessage(false, '', [{
									title: 'Successfully opened the DM!',
									footer: {
										text: `${targetUser.tag}`,
										icon_url: `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}?size=40`
									}
								}]);
							} catch(error){
								Logger.error(error);

								sendBotMessage(false, '', [{
									title: 'An error occurred while creating the DM',
									description: "Please send the console error to the developer.",
									footer: {
										text: error.message
									}
								}]);
							}
						} else {
							if(!/^[0-9]{18,}$/.test(userId)) {
								sendBotMessage(false, '', [{
									title: "OOOF!",
									description: `"${userId}" <- This is not an valid user ID.`
								}]);
							} else {
								sendBotMessage(false, '', [{
									title: "OOOF! I didn't get this user.",
									description: "Seems you given something wrong user's ID."
								}]);
							}
						}
					}
				},
				id: config.info.name,
				inputType: 0,
				name: "openDM",
				options: [
					{
						name: "UserID",
						required: true,
						type: 3,
						get description(){
							return "The user's ID to be open a DM";
						}
					}
				],
				type: 1,
				get description(){
					return config.info.description;
				}
			});
		};

		onStop(){
			const { BUILT_IN_COMMANDS, BUILT_IN_SECTIONS } = WebpackModules.getByProps("BUILT_IN_COMMANDS");

			const findCmdIndex = BUILT_IN_COMMANDS.findIndex(command=> command?.id == config.info.name);
			console.log(delete BUILT_IN_COMMANDS[findCmdIndex]);
			console.log(delete BUILT_IN_SECTIONS["KlartNET"]);
		};
	};
})(global.ZeresPluginLibrary.buildPlugin(config));
