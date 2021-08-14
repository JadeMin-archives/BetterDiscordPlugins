/**
 * @name YTEmbedSuggestion
 * @version 0.1.0
 * @author KlartNET
 * @authorId 840594543291269120
 * @description Removes the suggestion of random unrelated videos that appear when you pause any YouTube embedded video on Discord.
 * @source https://github.com/JadeMin/YTEmbedSuggestion
 * @updateUrl https://raw.githubusercontent.com/JadeMin/YTEmbedSuggestion/main/YTEmbedSuggestion.plugin.js
 **/


let interval = null;

class YTEmbedSuggestion {
	start() {
		interval = setInterval(()=> {
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
		clearInterval(interval);
	}
};
