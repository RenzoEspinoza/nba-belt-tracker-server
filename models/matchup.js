const knex = require('../utils/knex');
const got = require('got');

class Matchup{
    constructor(id, startTime, champ, challenger, streak, season, champScore, challScore, winner){
        this.id = id;
        this.startTime = startTime;
        this.champ = champ;
        this.challenger = challenger;
        this.streak = streak;
        this.season = season;
        this.champScore = champScore;
        this.challScore = challScore;
        this.winner = winner;
    }

    static findByDate(date) {
        return knex.first().from('matchups').whereRaw('??::date = ?', ['start_time_utc', date])
            .then(data => {
                const matchup = new Matchup(data.id, data.start_time_utc, data.champ,
                    data.challenger, data.streak, data.season,
                    data.champ_score, data.challenger_score, data.winner)
                    console.log('matchup on ' + date);
                    console.log(matchup);
                return matchup;
        });
    }

    static findLatest(){
        return knex.first().from('matchups').orderBy('start_time_utc', 'desc')
        .then(data => {
            const matchup = new Matchup(data.id, data.start_time_utc, data.champ,
                data.challenger, data.streak, data.season,
                data.champ_score, data.challenger_score, data.winner)
            return matchup;
        })
    }

    findUpcomingGame(){
        const newChamp = this.winner;
        let newChallenger;
        const streak = (this.champ === newChamp) ? this.streak + 1 : 1 ;
        return knex.first('start_time_utc', 'home_team_id', 'away_team_id', 'season')
            .from('schedule').whereRaw('? in (home_team_id, away_team_id)', [newChamp])
            .orderBy('start_time_utc', 'asc')
            .then(data => {
                newChallenger = (newChamp === data.home_team_id) ? data.away_team_id : data.home_team_id;
                const matchup = new Matchup(undefined, data.start_time_utc, newChamp,
                    newChallenger, streak, data.season);
                console.log('upcoming game:', matchup);
                return matchup;
        });
    }

    async getResults(){
        let date = this.startTime + 'Z';
        date = new Date(date);
        date.setHours(date.getHours() - 25); // BDL api's start times are off by 24/25 hours
        let results;
        let apiUrl = `https://balldontlie.io/api/v1/games?team_ids[]=${this.champ}&start_date=${date.toISOString()}&per_page=1`;
        try {
            results = JSON.parse((await got(apiUrl)).body);
            results = results.data[0];
        } catch (error) {
            console.error(error);
        }
        console.log('BDL api results:', results);
        if(results.home_team.id === this.champ){
            this.champScore = results.home_team_score;
            this.challScore = results.visitor_team_score;
        }
        else{
            this.challScore = results.home_team_score;
            this.champScore = results.visitor_team_score;
        }
        this.winner = (this.champScore > this.challScore) ? this.champ : this.challenger;
    }

    dbInsert(){
        return knex('matchups').returning('*')
            .insert({
                start_time_utc: this.startTime,
                champ: this.champ,
                challenger: this.challenger,
                streak: this.streak,
                season: this.season,
                champ_score: this.champScore,
                challenger_score: this.challScore,
                winner: this.winner
            })
            .then(response =>{
                console.log('dbInsert response:', response);
                return response;
            })
    }

    dbUpdate(){
        return knex('matchups').where('id', '=', this.id).returning('*')
            .update({
                champ_score: this.champScore,
                challenger_score: this.challScore,
                winner: this.winner
            })
            .then(response =>{
                console.log('dbUpdate response:', response);
                return response;
            })
    }

    dbDeleteUnneededGames(){
        return knex('schedule').returning('game_id').del()
        .where('start_time_utc', '<=', this.startTime).then(data => {
            console.log('deleted games:', data);
            return data;
        })
    }

    static findMatchupById(id) {
        //query DB for Matchup with matching 'id' field
        //return new Matchup instance
    }
}
module.exports = Matchup;
