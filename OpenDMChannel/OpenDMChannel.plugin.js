/**
 * @name OpenDMChannel
 * @source https://github.com/JadeMin/BetterDiscordPlugins/blob/main/OpenDMChannel/OpenDMChannel.plugin.js
**/
const config = {
	info: {
		name: "OpenDMChannel",
		authors: [{
			name: "KlartNET",
			github_username: "JadeMin",
			discord_id: "840594543291269120"
		}],
		version: "1.0.6",
		description: "Open a DM channel for specific user.",
		github_raw: "https://raw.githubusercontent.com/JadeMin/BetterDiscordPlugins/main/OpenDMChannel/OpenDMChannel.plugin.js"
	}
};



module.exports = !global.ZeresPluginLibrary? class {
	constructor(){ this._config = config; };

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
	};
	start(){};
	stop(){};
}:(([Plugin, Library])=> {
	const {
		WebpackModules, DiscordModules,
		PluginUpdater,
		Logger, Toasts
	} = Library;

	return class OpenDMChannel extends Plugin {
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
			const DiscordCommands = BdApi.findModuleByProps("BUILT_IN_COMMANDS");
			const {
				ApplicationCommandType: Types,
				ApplicationCommandOptionType: OptionTypes
			} = WebpackModules.getByProps("ApplicationCommandType");
			const sendBotMessage = (channelId, content, embed, DiscordAnalyticsSentry=null)=> {
				return DiscordModules.MessageActions.sendBotMessage(channelId || DiscordModules.SelectedChannelStore.getChannelId(), content, embed, DiscordAnalyticsSentry);
			};

			
			DiscordCommands.BUILT_IN_SECTIONS[config.info.name] = {
				//idk icon: "https://github.com/BetterDiscord.png",
				//WillBeUsedLater id: config.info.name,
				get name(){
					return config.info.name;
				}
			};
			DiscordCommands.BUILT_IN_COMMANDS.push({
				id: config.info.name,
				applicationId: config.info.name,
				type: Types.CHAT,
				options: [
					{
						name: "UserID",
						required: true,
						type: OptionTypes.STRING,
						get description(){
							return "The user ID that will be used to open the user's DM.";
						}
					}
				],
				name: "openDM",
				get description(){
					return config.info.description;
				},
				execute: async (args, {guild, channel}) => {
					const argumentUser = args.find(argument=> argument?.name == "UserID");
					const userId = argumentUser.value;
					const targetUser = DiscordModules.UserStore.getUser(userId);
					
					if(userId == DiscordModules.UserStore.getCurrentUser().id) {
						return sendBotMessage(false, '', [{
							title: "OOOF!",
							description: "You cannot open your DM by yourself."
						}]);
					}
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
								title: 'An error occurred while opening the DM!',
								description: "Please send the Console error to the developer.",
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
								description: "Seems you given something wrong user ID."
							}]);
						}
					}
				},
			});
		};

		onStop(){
			const { BUILT_IN_COMMANDS, BUILT_IN_SECTIONS } = WebpackModules.getByProps("BUILT_IN_COMMANDS");

			Logger.log(delete BUILT_IN_COMMANDS[BUILT_IN_COMMANDS.findIndex(cmd=> cmd?.id == config.info.name)]);
			Logger.log(delete BUILT_IN_SECTIONS[config.info.name]);
		};
	};
})(global.ZeresPluginLibrary.buildPlugin(config));
