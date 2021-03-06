const matchupRouter = require('express').Router();
const Matchup = require('../models/matchup');

matchupRouter.get('/latest', async (req, res) => {
    let lastTwoMatchups = await Matchup.findLastTwoMatchups();
    for await (const matchup of lastTwoMatchups){
        await matchup.champ.getTeamName();
        await matchup.challenger.getTeamName();
    }
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

module.exports = matchupRouter;