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
	test(false);
}

function longTest()
{
	test(true);
}

function dictEveryValue(dict, predicate)
{
	return Object.values(dict).every(val => predicate(val));
}

function dictAllValuesPosivite(dict)
{
	return dictEveryValue(dict, val => val > 0);
}

function test(isLong)
{
	const startTime = Date.now();
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
			if (isLong) {
				return false;
			}
			allFound = dictAllValuesPosivite(goalsCounters);
			if (allFound) {
				debugAlert("Found all goals. Had to check up to seed " + seed + ".");
				return true;
			}
			return false;
		}
	);
	allFound = dictAllValuesPosivite(goalsCounters);
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
	}
	debugLog("Goal frequencies:");
	const sortedGoals = sortDictionary(goalsCounters);
	for (const pair of sortedGoals) {
		debugLog("  \"" + pair[0] + "\" = " + pair[1]);
	}
	const finishTime = Date.now();
	debugLog("Test took " + (finishTime - startTime) + " ms");
}

function forAllSeedsAndDifficulties(prepGoal, sheetConsumer, stopCondition)
{
	let version = findReallyLatestVersion();
	debugLog("Testing version:");
	debugLog("id = " + version.id + "; name = " + version.name);
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

// returns a list of pairs
// https://stackoverflow.com/a/25500462/1083697
function sortDictionary(dict)
{
	// Create items array
	var items = Object.keys(dict).map(key => [key, dict[key]]);

	// Sort the array based on the second element
	items.sort(function(a, b) {
		return a[1] - b[1];
	});

	return items;
}

function getGoalNameWithoutRanges(rawGoalName)
{
	return getGoalNameWithouNumbers(rawGoalName.replace(/\(\d+[-]\d+\)/g, ""));
}

function getGoalNameWithoutNumbers(rawGoalName)
{
	return rawGoalName.replace(/\d+/g, "");
}

