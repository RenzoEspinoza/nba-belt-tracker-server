const knex = require('../utils/knex');
const got = require('got');
const Team = require('./team')

class Matchup{
    constructor(id, startTime, champ, challenger, streak, season, winner, venue){
        this.id = id;
        this.startTime = startTime;
        this.champ = champ;
        this.challenger = challenger;
        this.streak = streak;
        this.season = season;
        this.winner = winner;
        this.venue = venue;
    }

    static findLatest(){
        return knex('matchups').first().orderBy('start_time_utc', 'desc')
        .then(data => {
            const champ = new Team(data.champ_id, data.champ_score);
            const challenger = new Team(data.challenger_id, data.challenger_score);
            const matchup = new Matchup(data.id, data.start_time_utc,champ, challenger,
                data.streak, data.season, data.winner, data.venue);
            console.log('latest matchup: ', matchup);
            return matchup;
        })
    }

    static findLastTwoMatchups(){
        let matchups = new Array(2);
        return knex('matchups').limit(2).orderBy('start_time_utc', 'desc')
        .then(data => {
            for (let i = 0; i < 2; i++) {
                let champ = new Team(data[i].champ_id, data[i].champ_score);
                let challenger = new Team(data[i].challenger_id, data[i].challenger_score);
                matchups[i] = new Matchup(data[i].id, data[i].start_time_utc,champ, challenger,
                    data[i].streak, data[i].season, data[i].winner, data[i].venue);
            }
            console.log('last two matchups: ', matchups);
            return matchups;
        })
    }

    static getLatestSeason(){
        return knex('matchups').first('season').orderBy('start_time_utc', 'desc')
        .then(data => {
            console.log('latest season:', data);
            return data;
        })
    }

    static getMatchups(season){
        return knex('matchups').orderBy('start_time_utc', 'asc').where('season', '=', season)
        .then(data => {
            console.log('All matchups during season:', season);
            console.log(data);
            return {[season] : data};
        })
    }

    static seasonsBefore(season){
        return knex('matchups').orderBy('start_time_utc', 'asc').whereNot('season', '=', season)
        .then(data => {
            const splitBySeason = data.reduce(function(container, i) {
                if (!container[i['season']]) { container[i['season']] = []; }
                container[i['season']].push(i);
                return container;
              }, {});  
            return splitBySeason;
        })
    }

    findUpcomingGame(){
        const newChampId = this.winner;
        let newChallengerId;
        let matchup;
        const streak = (this.champ.id === newChampId) ? this.streak + 1 : 1 ;
        return knex.transaction(trx =>{
            return knex('schedule').transacting(trx)
            .first('start_time_utc', 'home_team_id', 'away_team_id', 'season')
            .whereRaw('? in (home_team_id, away_team_id)', [newChampId])
            .orderBy('start_time_utc', 'asc')
            .then(data => {
                newChallengerId = (newChampId === data.home_team_id) ? data.away_team_id : data.home_team_id;
                matchup = new Matchup(undefined, data.start_time_utc, new Team(newChampId),
                    new Team(newChallengerId), streak, data.season);
                return knex('teams')
                .where('id','=', data.home_team_id)
                .returning('arena')
                .then(result =>{
                    console.log('first query result: ', data);
                    console.log('second query result: ', result);
                    matchup.venue = result[0].arena;
                    return matchup;
                })
            })
            .then(trx.commit)
            .catch(trx.rollback);
        });
    }

    async getResults(){
        let date = this.startTime + 'Z';
        date = new Date(date);
        date.setHours(date.getHours() - 25); // BDL api's start times are off by 24/25 hours
        let results;
        let apiUrl = `https://balldontlie.io/api/v1/games?team_ids[]=${this.champ.id}&start_date=${date.toISOString()}&per_page=1`;
        try {
            results = JSON.parse((await got(apiUrl)).body);
            results = results.data[0];
        } catch (error) {
            console.error(error);
        }
        console.log('BDL api results:', results);
        if(results.status != 'Final') throw Error;
        if(results.home_team.id === this.champ.id){
            this.champ.score = results.home_team_score;
            this.challenger.score = results.visitor_team_score;
        }
        else{
            this.challenger.score = results.home_team_score;
            this.champ.score = results.visitor_team_score;
        }
        this.winner = (this.champ.score > this.challenger.score) ? this.champ.id : this.challenger.id;
    }

    dbInsert(){
        return knex('matchups').returning('*')
            .insert({
                start_time_utc: this.startTime,
                champ_id: this.champ.id,
                challenger_id: this.challenger.id,
                streak: this.streak,
                season: this.season,
                champ_score: this.champ.score,
                challenger_score: this.challenger.score,
                winner: this.winner,
                venue: this.venue
            })
            .then(response =>{
                console.log('dbInsert response:', response);
                return response[0].id;
            })
    }

    dbUpdateMatchResults(){
        return knex('matchups').where('id', '=', this.id).returning('*')
            .update({
                champ_score: this.champ.score,
                challenger_score: this.challenger.score,
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
}
module.exports = Matchup;
