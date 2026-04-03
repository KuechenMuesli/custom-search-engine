function getQueryParam() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("q");
}

function parseCommandAndQuery(input) {
	if (input === null) return { command: null, query: null };
	const match = input.match(/(![a-z]*)(?=\s|$)/);
	if (!match) return { command: null, query: input };
	const command = match[1];
	const rest = (input.slice(0, match.index) + input.slice(match.index + command.length))
		.replace(/\s+/g, ' ')
		.trim();
	return { command, query: rest };
}

window.renderUI = function() {
	const listContainer = document.getElementById("command-list");
	if (!listContainer) return;

	listContainer.innerHTML = "";

	if (localStorage.length === 0) {
		localStorage.setItem("DEFAULT", "https://duckduckgo.com/?q=%s");
	}

	const keys = Object.keys(localStorage).sort();

	keys.forEach(key => {
		const value = localStorage.getItem(key);
		const row = document.createElement("div");
		row.className = "grid-row";

		row.innerHTML = `
			<div><strong>${key}</strong></div>
			<div><input type="text" value="${value}" id="input-${key}" style="width: 95%;" onkeydown="handleEnter(event, '${key}')"></div>
			<div>
				<button onclick="updateCommand('${key}')">Update</button>
				<button onclick="deleteCommand('${key}')" style="color: red;">Delete</button>
			</div>
		`;
		listContainer.appendChild(row);
	});
};

window.addCommand = function() {
	const key = document.getElementById("new-command").value.trim();
	const url = document.getElementById("new-url").value.trim();
	if (key && url) {
		localStorage.setItem(key, url);
		document.getElementById("new-command").value = "";
		document.getElementById("new-url").value = "";
		renderUI();
	}
};

window.updateCommand = function(key) {
	const newValue = document.getElementById(`input-${key}`).value;
	if (newValue) {
		localStorage.setItem(key, newValue);
		renderUI();
	}
};

window.deleteCommand = function(key) {
	if (confirm(`Delete shortcut for ${key}?`)) {
		localStorage.removeItem(key);
		renderUI();
	}
};

window.handleEnter = function(event, key) {
	if (event.key === "Enter") {
		if (event.target.id === "main-search") {
			executeSearch();
		} else if (key) {
			updateCommand(key);
		} else {
			addCommand();
		}
	}
};

window.executeSearch = function() {
    const input = document.getElementById("main-search").value.trim();
    if (!input) return;

    const { command, query } = parseCommandAndQuery(input);
    const searchEngineUrl = localStorage.getItem(command) || localStorage.getItem("DEFAULT");

    if (searchEngineUrl) {
        const redirectUrl = searchEngineUrl.replace("%s", encodeURIComponent(query || ""));
        window.location.href = redirectUrl; // Use .href for normal search from UI
    }
};

document.getElementById("main-search")?.addEventListener("keydown", (e) => handleEnter(e));

document.addEventListener("DOMContentLoaded", () => {
	const queryParam = getQueryParam();
	if (queryParam) {
		const { command, query } = parseCommandAndQuery(queryParam);
		const searchEngineUrl = localStorage.getItem(command) || localStorage.getItem("DEFAULT");
		if (searchEngineUrl) {
			const redirectUrl = searchEngineUrl.replace("%s", encodeURIComponent(query || ""));
			window.location.replace(redirectUrl);
		}
	} else {
		renderUI();
	}
});