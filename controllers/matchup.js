const matchupRouter = require('express').Router();
const Matchup = require('../models/matchup');

matchupRouter.get('/date/:date', async (req, res) => {
    const date = req.params.date;
    console.log(date);
    const matchup = await Matchup.findMatchupByDate(date);
    res.json(matchup);
})

matchupRouter.get('/id/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    const matchup = Matchup.findMatchupById(id);
    console.log(matchup);
    res.json(matchup);
})

matchupRouter.get('/next-match/:date', (req, res) => {

})
// /next-match/:date route

module.exports = matchupRouter;