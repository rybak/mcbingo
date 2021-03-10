var HTML_LOG;

$(document).ready(() => {
	HTML_LOG = $("#tests-log");
});
function debugLog(msg)
{
	console.log(msg);
	HTML_LOG.append(msg + "<br>");
}

function debugAlert(msg)
{
	debugLog(msg);
	alert(msg);
}

function findReallyLatestVersion()
{
	for (const version of VERSIONS)
	{
		if (!version.stable)
		{
			return version;
		}
	}
	return VERSIONS[VERSIONS.length - 1];
}

function shortTest()
{
	let version = findReallyLatestVersion();
	console.log("Testing version:");
	console.log(version);
	let listOfGoalsByDifficulty = version.goals;
	let goalsCounters = {};
	debugLog("List of all goals:");
	for (var difficulty = 0; difficulty < listOfGoalsByDifficulty.length; difficulty++)
	{
		debugLog("  Difficulty: " + difficulty);
		for (const goal of listOfGoalsByDifficulty[difficulty])
		{
			debugLog("    " + goal.name);
			goalsCounters[goal.name] = 0;
		}
	}

	let allFound = false;
	for (let seed = 10000; seed < 100000; seed++)
	{
		for (let difficulty = 0; difficulty < listOfGoalsByDifficulty.length; difficulty++)
		{
			let urlDifficulty = difficulty + 1;
			Math.seedrandom(seed.toString()); // must seed the random before every generation
			let result = version.generator("random", urlDifficulty, listOfGoalsByDifficulty);
			for (const goal of result)
			{
				goalsCounters[goal.name]++;
			}
		}
		if (seed % 10000 == 0) {
			debugLog("CHECKED UP TO SEED = " + seed);
		}
		allFound = Object.values(goalsCounters).every(counter => counter > 0);
		if (allFound)
		{
			debugAlert("Found all goals. Had to check up to seed " + seed + ".");
			break;
		}
	}
	if (!allFound)
	{
		debugAlert("Could not find some of the goals");
		for (let name in goalsCounters)
		{
			if (goalsCounters[name] == 0)
			{
				debugLog("Could not find goal '" + name + "' in any of the seeds");
			}
		}
	} else {
		var rare = [];
		debugLog("Goal frequencies:");
		for (let name in goalsCounters)
		{
			debugLog("  \"" + name + "\" = " + goalsCounters[name]);
			if (goalsCounters[name] < 10)
			{
				rare.push(name);
			}
		}
		debugLog("Rarest goals:");
		for (const name of rare)
		{
			debugLog("  \"" + name + "\" = " + goalsCounters[name]);
		}
	}

}

function getGoalNameWithoutRanges(rawGoalName)
{
	return getGoalNameWithouNumbers(rawGoalName.replace(/\(\d+[-]\d+\)/g, ""));
}

function getGoalNameWithoutNumbers(rawGoalName)
{
	return rawGoalName.replace(/\d+/g, "");
}

