const matchupRouter = require('express').Router();
const Matchup = require('../models/matchup');

matchupRouter.get('/date/:date', async (req, res) => {
    const date = req.params.date;
    console.log(date);
    const matchup = await Matchup.findMatchupByDate(date);
    res.json(matchup);
})

matchupRouter.get('/id/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const matchup = await Matchup.findMatchupById(id);
    console.log(matchup);
    res.json(matchup);
})

matchupRouter.get('/latest', async (req, res) => {
    const lastMatchups = await Matchup.findLastTwoMatchups();
    for await (const matchup of lastMatchups){
        await matchup.champ.getTeamName();
        await matchup.challenger.getTeamName();
    }
    res.json(lastMatchups)
})

module.exports = matchupRouter;