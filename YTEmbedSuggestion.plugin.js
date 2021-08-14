/**
 * @name YTEmbedSuggestion
 * @version 0.1.0
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Removes the suggestion of random unrelated videos that appear when you pause any YouTube embedded video on Discord.
 * @source https://github.com/JadeMin/YTEmbedSuggestion
 * @updateUrl https://raw.githubusercontent.com/JadeMin/YTEmbedSuggestion/main/YTEmbedSuggestion.plugin.js
 **/


module.exports = (()=> {
	const config = {
		"info": {
			"name": "YTEmbedSuggestion",
			"author": "KlartNET",
			"version": "0.1.0",
			"authorId": "840594543291269120",
			"description": "Allows you to download all Themes from BD's Website within Discord",
			"source": "https://github.com/JadeMin/YTEmbedSuggestion",
			"updateUrl": "https://raw.githubusercontent.com/JadeMin/YTEmbedSuggestion/main/YTEmbedSuggestion.plugin.js",
		}
	};


	return class {
		getName(){ return config.info.name; }
		getAuthor(){ return config.info.author; }
		getVersion(){ return config.info.version; }

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
			if(interval) clearInterval(this.interval);
			else {
				console.warn(`[${config.info.name}] interval is ${interval}`);
			}
		}
	};
})();
