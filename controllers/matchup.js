const matchupRouter = require('express').Router();
const Matchup = require('../models/matchup');
const schedule = require('node-schedule');

let lastTwoMatchups;
(async () => {
    lastTwoMatchups = await getLastTwoMatchups();
    const endTime = new Date(lastTwoMatchups[0].startTime+'Z').addHours(3);
    console.log('Server will update matchups at:', endTime.toString());
    const job = schedule.scheduleJob(endTime, async () =>{
        try {
            await updateMatchups();
        } catch (error) {
            job.reschedule(endTime.addHours(1));
        }
        let newTime = new Date(lastTwoMatchups[0].startTime+'Z').addHours(3);
        console.log('Server will update matchups at new time:', newTime.toString())
        job.reschedule(newTime);
    });
})();

matchupRouter.get('/latest', async (req, res) => {
    res.json(lastTwoMatchups);
})

matchupRouter.get('/season/current', async (req, res) => {
    const latestSeason = await Matchup.getLatestSeason();
    res.json(latestSeason);
})

matchupRouter.get('/:season', async (req, res) => {
    const season = req.params.season;
    const matchups = await Matchup.getMatchups(season);
    res.json(matchups);
})

matchupRouter.get('/before/:season', async (req, res) =>{
    const currentSeason = req.params.season;
    const history = await Matchup.seasonsBefore(currentSeason);
    res.json(history);
})

async function getLastTwoMatchups(){
    let result = await Matchup.findLastTwoMatchups();
    for await (const matchup of result){
        await matchup.champ.getTeamName();
        await matchup.challenger.getTeamName();
    }
    return result;
}

async function updateMatchups(){
    await lastTwoMatchups[0].getResults();
    await lastTwoMatchups[0].dbUpdateMatchResults();
    await lastTwoMatchups[0].dbDeleteUnneededGames();
    const nextMatch = await lastTwoMatchups[0].findUpcomingGame();
    nextMatch.id = await nextMatch.dbInsert();
    lastTwoMatchups.pop();
    lastTwoMatchups.unshift(nextMatch);
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}

module.exports = matchupRouter;