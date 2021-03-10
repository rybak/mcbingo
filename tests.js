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
	let goalsCounters = {};
	let allFound = false;
	forAllSeedsAndDifficulties(
		goal => {
			goalsCounters[goal.name] = 0;
		},
		result => {
			for (const goal of result)
			{
				goalsCounters[goal.name]++;
			}
		},
		(seed) => {
			allFound = Object.values(goalsCounters).every(counter => counter > 0);
			if (allFound)
			{
				debugAlert("Found all goals. Had to check up to seed " + seed + ".");
				return true;
			}
			return false;
		}
	);
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
		var max = 0;
		var maxName = "";
		for (let name in goalsCounters)
		{
			let c = goalsCounters[name];
			debugLog("  \"" + name + "\" = " + c);
			if (c < 10)
			{
				rare.push(name);
			}
			if (c > max)
			{
				maxName = name;
				max = c;
			}
		}
		debugLog("Rarest goals:");
		for (const name of rare)
		{
			debugLog("  \"" + name + "\" = " + goalsCounters[name]);
		}
		debugLog("Most common goal: \"" + maxName + "\" = " + max);
	}
}

function forAllSeedsAndDifficulties(prepGoal, sheetConsumer, stopCondition)
{
	let version = findReallyLatestVersion();
	debugLog("Testing version:");
	debugLog(version.toString());
	let listOfGoalsByDifficulty = version.goals;
	debugLog("List of all goals:");
	for (var difficulty = 0; difficulty < listOfGoalsByDifficulty.length; difficulty++)
	{
		debugLog("  Difficulty: " + difficulty);
		for (const goal of listOfGoalsByDifficulty[difficulty])
		{
			debugLog("    " + goal.name);
			prepGoal(goal);
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
			sheetConsumer(result);
		}
		if (seed % 10000 == 0) {
			debugLog("CHECKED UP TO SEED = " + seed);
		}
		if (stopCondition(seed)) {
			break;
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

