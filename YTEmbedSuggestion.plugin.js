/**
 * @name YTEmbedSuggestion
 * @version 0.1.0
 * @author Coffaine
 * @description Removes the suggestion of random unrelated videos that appear when you pause any YouTube embedded video on Discord.
 */


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
