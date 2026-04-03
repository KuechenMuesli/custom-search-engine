function getQueryParam() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("q");
}

function parseCommandAndQuery(input) {
	if (input === null)
		return {
			command: null,
			query: null,
		};

	const match = input.match(/(![a-z]*)(?=\s|$)/);

	if (!match) {
		return {
		    command: null,
		    query: input
		};
	}

  	const command = match[1];

	const rest = (input.slice(0, match.index) + input.slice(match.index + command.length))
	  .replace(/\s+/g, ' ')
	  .trim();

	  return { command, query: rest };
}

function generateCommandMap() {
	const keys = Object.keys(localStorage);

	if (keys.length === 0) 
		localStorage.setItem("DEFAULT", "https://www.google.com/search?q=%s");

	var keymap = new Map();

	keys.forEach(key => {
		keymap.set(key, localStorage.getItem(key));
	});

	return keymap;
}


const queryParam = getQueryParam();

if (queryParam) {
	const { command, query } = parseCommandAndQuery(queryParam);

	const commandMap = generateCommandMap();

	const searchEngineUrl = commandMap.get(command) ?? commandMap.get("DEFAULT");
	const redirectUrl = searchEngineUrl.replace("%s", query);

	window.location.replace(redirectUrl);
}