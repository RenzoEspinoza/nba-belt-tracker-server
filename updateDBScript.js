const Matchup = require('./models/matchup');
const config = require('../utils/config');
const got = require('got');

(async () => {
    const latestMatchup = await Matchup.findLatest();
    const endTime = new Date(latestMatchup.startTime+'Z').addHours(3);
    if(Date.now() < endTime) return;
    await latestMatchup.getResults();
    await latestMatchup.dbUpdateMatchResults();
    await latestMatchup.dbDeleteUnneededGames();
    const nextMatch = await lastTwoMatchups[0].findUpcomingGame();
    nextMatch.id = await nextMatch.dbInsert();
    const buildTrigger = JSON.parse((await got(config.DEPLOY_HOOK)).body);
    console.log('build trigger:', buildTrigger);
})