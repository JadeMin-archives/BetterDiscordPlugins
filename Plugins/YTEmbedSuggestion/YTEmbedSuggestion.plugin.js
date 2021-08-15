/**
 * @name YTEmbedSuggestion
 * @version 0.1.0
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Replaces irrelevant video recommendations that appear when playing a YouTube embedded video on Discord. _**(You can't remove "More Videos" itself with this plugin.)**_
 * @source https://github.com/JadeMin/BetterDiscordAddons/tree/main/Plugins/YTEmbedSuggestion/
 * @updateUrl https://raw.githubusercontent.com/JadeMin/BetterDiscordAddons/YTEmbedSuggestion/Plugins/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js
 **/


module.exports = (()=> {
	const config = {
		info: {
			"name": "YTEmbedSuggestion",
			"author": "KlartNET",
			"version": "0.1.0",
			"description": "Replaces irrelevant video recommendations that appear when playing a YouTube embedded video on Discord. _**(You can't remove \"More Videos\" itself with this plugin.)**_"
		}
	};


	return class {
		constructor(){
			this._config = config;
			this._interval = null;
		}
		getName(){ return config.info.name; }
		getAuthor(){ return config.info.author; }
		getVersion(){ return config.info.version; }
		getDescription(){ return config.info.description; }
		
		start() {
			this._interval = setInterval(()=> {
				document.querySelectorAll("iframe[src^='https://www.youtube.com/embed/']").forEach(element=> {
					const identifier = element.src.endsWith("&rel=0");
					if(!identifier) {
						console.log({
							src: element.src,
							identifier
						});
					}	
					
					if(!identifier) element.src += "&rel=0";
				});
			}, 0);
		} 
		stop() {
			if(this._interval) {
				clearInterval(this._interval);
			} else {
				console.warn(`[${config.info.name}] interval is ${this._interval}`);
			}
		}
	};
})();
