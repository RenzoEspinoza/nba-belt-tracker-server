const knex = require('../utils/knex');

class Team{
    constructor(id, score, name){
        this.id = id;
        this.score = score;
        this.name = name;
    }

    async getTeamName(){
        return knex('teams').first('name').where('id', '=', this.id)
        .then(data => {
            this.name = data.name;
            console.log(this.id, this.name);
        })
    }
}

module.exports = Team;