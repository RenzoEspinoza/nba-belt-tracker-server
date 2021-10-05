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

    findMatchupByDate(date) {
        //query DB for Matchup with matching 'date' field
        //return new Matchup instance
    }

    findMatchupById(id) {
        //query DB for Matchup with matching 'id' field
        //return new Matchup instance
    }

}
module.exports = Matchup;
