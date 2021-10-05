const matchupRouter = require('express').Router();
const Matchup = require('../models/matchup');

matchupRouter.get('/date/:date', (req, res) => {
    const date = req.params.date;
    console.log(date);
    const matchup = Matchup.findMatchupByDate(date);
    res.json(matchup);
})

matchupRouter.get('/id/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    const matchup = Matchup.findMatchupById(id);
    res.json(matchup);
})

module.exports = matchupRouter;