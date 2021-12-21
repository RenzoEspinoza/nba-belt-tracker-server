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

matchupRouter.post('/test', async (req, res) => {
    // used for manually adding matchups to DB for now until the frontend is finished
    const pastMatchup = await Matchup.findLatest();
    await pastMatchup.getResults();
    await pastMatchup.dbUpdateMatchResults();
    await pastMatchup.dbDeleteUnneededGames();
    const nextMatch = await pastMatchup.findUpcomingGame();
    await nextMatch.dbInsert();
})

module.exports = matchupRouter;