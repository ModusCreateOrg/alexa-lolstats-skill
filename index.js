'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

// Your Riot API Key
var API_BASE="<your_riot_api>";


// Figures out what Lambda Function to run


exports.handler = function(event, context, callback) {
	try {
		event.session.application.applicationId !=
			"<your_app_id>"
	}
	catch (err) {
		event.session.application.applicationID = err.message;
	}

	if(event.session.new) {
		onSessionStarted({"requestId": event.request.requestId}, event.session);
	}

	if(event.request.type === "LaunchRequest") {
		onLaunch(event.request, event.session, callback);
	}
	else if(event.request.type === "IntentRequest") {
		onIntent(event.request, event.session, callback);
	}
	else {
		onSessionEnded();
	}

};

// Start New Session Message
function onSessionStarted(sessionStartedRequest, session) {
	console.log("Starting new session");
}

// Welcome Message
function onLaunch(launchRequest, session, callback) {
	getWelcomeResponse(callback);
}

// Figure out what Intent to run 
function onIntent(intentRequest, session, callback) {
	var intent = intentRequest.intent;
	var intentName = intentRequest.intent.name;

	try {
		if(intentName === "GetMyRank") {
			getCurrentPlayerRank(callback);
		}
		else if(intentName === "GetMyMostPlayed") {
			getCurrentPlayerMostPlayed(callback);
		}
		else if(intentName === "AMAZON.HelpIntent") {
			getWelcomeResponse(callback);
		}
		else if(intentName === "AMAZON.CancelIntent" || intentName === "AMAZON.StopIntent") {
			handleSessionEndRequest(callback);
		}
	}
	catch(err) {
		err.message = intentName + " is not a valid intent";
		console.log(err);
	}


}

// End session if user does nothing
function onSessionEnded() {
	console.log("Ending Session");
}

// Welcome Message function
function getWelcomeResponse(callback) {
	var sessionAttributes = {};
	var cardTitle = "League of Legends";
	var speechOutput = "Hello, Summoner. " 
		+ "Would you like to know your rank, or " 
		+ "would you like to know your most played Champion?";
	var repromptText = "Please ask me if would like to know your rank" 
		+ "or if you would like to know your most played Champion";

	var shouldEndSession = false;

	console.log("Hello World!");
	callback(null, buildResponse(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession)));
}

// Gets My Current Rank from Riots API
var getCurrentPlayerRank = (callback) => {
	let sessionAttributes = {};
	let cardTitle = "LoL Player Rank";
	let repromptText = "";
	let shouldEndSession = false;
	let RANK_API = "https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/55517090/entry?api_key=" + API_BASE;
	let summonerID = 55517090;

	fetch(RANK_API)
		.then(function(response) {
			if (response.status >= 400) {
				throw new Error("Bad response from server");
			}
			return response.json();
		})
		.then(function(summonerInfo) {
			console.log(summonerInfo);
			let response = summonerInfo;
			let rank = response[summonerID][0].tier 
			+ " " 
			+ response[summonerID][0].entries[0].division;

			let speechOutput = "Your rank is " + rank;
			console.log(speechOutput);
			 callback(null, buildResponse(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession)));

		})


}

// Gets my most played champion name based on last 10 normal games.
function getCurrentPlayerMostPlayed(callback) {
	let sessionAttributes = {};
	let cardTitle = "LoL Champion Most Played";
	let repromptText = "";
	let shouldEndSession = false;
	let MPLAYED_API = "https://na.api.pvp.net/api/lol/na/v1.3/game/by-summoner/55517090/recent?api_key=" + API_BASE;
	let summonerID = 55517090;

	fetch(MPLAYED_API)
		.then(function(response) {
			if (response.status >= 400) {
				throw new Error("Bad response from server");
			}
			return response.json();
		})
		.then(function(summonerInfo) {
			console.log(summonerInfo);
			// Returns the last 10 games I played
			let response = summonerInfo;
			let champIds = [];
			
			// Filters out ARAM games from the array of games
			let filterNormGames = response.games.filter(function(el) {
				return 	"ARAM_UNRANKED_5x5".indexOf(el.subType);
			})
			
			// Sorts the games by date played starting with the latest
			let dateSort = filterNormGames.sort(function(a,b) {
				return new Date(b.createDate) - new Date(a.createDate);
			});
			
			// Sort champion by IDs from lowest number to highest
			let champSort = dateSort.sort(function(a,b) {
				return parseFloat(a.championId) - parseFloat(b.championId);
			})

			// Grabs champion IDs and puts them into its own array "champIds"
			for (var v in champSort) {
				champIds.push(champSort[v].championId);
			}

			// Finds the ID in "champIds" that occurs the most
			var frequency = {};
			var max = 0;
			var champIdMode;
			for (var v in champIds) {
				frequency[champIds[v]]=(frequency[champIds[v]] || 0)+1;
				if(frequency[champIds[v]] > max) {
					max = frequency[champIds[v]];
					champIdMode = champIds[v];
				}
			}

			getChampByID(champIdMode, function(champName){
				let speechOutput = "In the last ten normal games, you've played " + champName + " the most."
				callback(null, buildResponse(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession)));
			});

		})
}

function getChampByID(id, callback) {

	let CHAMP_API = "https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion/" + id + "?api_key=" + API_BASE;

	fetch(CHAMP_API)
		.then(function(response) {
			if(response.status >= 400) {
				throw new Error("Bad response from server");
			}
			return response.json();
		})
		.then(function(champInfo) {
			console.log(champInfo);
			callback(champInfo.name);
		})
}

function handleSessionEndRequest(callback) {
	let cardTitle = "LoL - Thanks";
	let speechOutput = "Goodbye for now, Summoner";
	let shouldEndSession = true;

	callback(null, buildResponse({}, buildSpeechletResponse(cardTitle, speechOutput, None, shouldEndSession)));
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
	return {
		"outputSpeech": {
			"type": "PlainText",
			"text": output
		},
		"card": {
			"type": "Simple",
			"title": title,
			"content": output
		},
		"reprompt": {
			"outputSpeech": {
				type: "PlainText",
				"text": repromptText
			}
		},
		"shouldEndSession": shouldEndSession
	}
}

function buildResponse(sessionAttributes, speechletReponse) {
	return {
		"version": "1.0",
		"sessionAttributes": sessionAttributes,
		"response": speechletReponse
	}
}


// var event = {
//   "session": {
//     "sessionId": "SessionId.942fab75-3a42-43af-ae5f-957e2d48525a",
//     "application": {
//       "applicationId": "amzn1.echo-sdk-ams.app.ba80548d-ec48-4479-9641-5e48d2b54345"
//     },
//     "attributes": {},
//     "user": {
//       "userId": "amzn1.ask.account.AFP3ZWPOS2BGJR7OWJZ3DHPKMOMNWY4AY66FUR7ILBWANIHQN73QGES22MSIICZIPJSH6CM4NNFQUKAR7XOOIAKW3ZX25OBF7LTLWDCPNYBUEEJFKJLRJPNYMHFQCAQDZTYF5UHMEIPFY6UECRMLY3WXKKFICFUPWCYEGUGMBTMFXEANSG2ZDYFRWCQIMM5OPOQHBAPCZDFTWGI"
//     },
//     "new": true
//   },
//   "request": {
//     "type": "IntentRequest",
//     "requestId": "EdwRequestId.9cee108c-9507-44cf-bf9d-fe6de5fac3b2",
//     "timestamp": "2016-07-13T21:55:37Z",
//     "intent": {
//       "name": "GetMyRank",
//       "slots": {}
//     },
//     "locale": "en-US"
//   },
//   "version": "1.0"
// }

// try {
// 	event.session.application.applicationId !=
// 		"amzn1.echo-sdk-ams.app.ba80548d-ec48-4479-9641-5e48d2b54345"
// }
// catch (err) {
// 	event.session.application.applicationID = err.message;
// }

// if(event.session.new) {
// 	onSessionStarted({"requestId": event.request.requestId}, event.session);
// }

// if(event.request.type === "LaunchRequest") {
// 	return onLaunch(event.request, event.session);
// }
// else if(event.request.type === "IntentRequest") {
// 	// return onIntent(event.request, event.session);
// 	console.log(onIntent(event.request, event.session));
// }
// else {
// 	return onSessionEnded();
// }

