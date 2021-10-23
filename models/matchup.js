const db = require('../utils/knex')
//define schema for matchup

class Matchup{
    constructor(id, date, champ, challenger, streak, season){
        this.id = id;
        this.date = date;
        this.champ = champ;
        this.challenger = challenger;
        this.streak = streak;
        this.season = season;
    }

    static findMatchupByDate(date) {
        //query DB for Matchup with matching 'date' field
        //return new Matchup instance
        return db.select('*').from('matchups').whereRaw('?? = ?::date', ['date', date]).then(data => {
            return data;
        });
    }

    static

    static findMatchupById(id) {
        //query DB for Matchup with matching 'id' field
        //return new Matchup instance
    }

}
module.exports = Matchup;
