/**
 * @name YTEmbedSuggestion
 * @version 0.1.0
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Replaces the suggestion of random unrelated videos that appear when you pause a YouTube embedded video on Discord.
 * @source https://github.com/JadeMin/BetterDiscordAddons/
 * @updateUrl https://raw.githubusercontent.com/JadeMin/BetterDiscordAddons/main/Plugins/YTEmbedSuggestion/YTEmbedSuggestion.plugin.js
 **/


module.exports = (()=> {
	const config = {
		"info": {
			"name": "YTEmbedSuggestion",
			"author": "KlartNET",
			"version": "0.1.0",
			"description": "Replaces the suggestion of random unrelated videos that appear when you pause a YouTube embedded video on Discord."
		}
	};


	return class {
		getName(){ return config.info.name; }
		getAuthor(){ return config.info.author; }
		getVersion(){ return config.info.version; }
		getDescription(){ return config.info.description; }

		load() {
			this.interval = null;
		}
		start() {
			this.interval = setInterval(()=> {
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
			if(this.interval) {
				clearInterval(this.interval);
			} else {
				console.warn(`[${config.info.name}] interval is ${interval}`);
			}
		}
	};
})();
