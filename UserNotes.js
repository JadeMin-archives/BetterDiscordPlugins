class NOTEY {
	constructor(){
		this._NOTES = null;
	}

	fetchNotes(){
		return new Promise(resolve => {
			ZLibrary.DiscordModules.APIModule.get(ZLibrary.DiscordModules.DiscordConstants.Endpoints.NOTES).then(response=> {
				resolve([response.body, response]);
				this._NOTES = [response.body, response];
			});
		});
	}
	updateNote(id, value){
		return ZLibrary.WebpackModules.getByProps("updateNote").updateNote(id, value);
	}
};
const Notey = new NOTEY();


// fetches all users' note data from Discord API (Endpoints)
Notey.fetchNotes().then(([userNotes, _ApiResponse])=> {
	for(const id in userNotes) {
		const targetUser = ZLibrary.DiscordModules.UserStore.getUser(id);
		console.log(`${targetUser || "Unknown"} (${id}) | ${userNotes[id]}`);
	}
});

// edits a specific user's note
Notey.updateNote('id', "a note content to be edited");
