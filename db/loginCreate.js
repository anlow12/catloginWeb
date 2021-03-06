var pg = require('pg');
var moment = require('moment');

module.exports = function(req, res){
    
    var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/logincats';
    
    if(req.username == undefined || req.password == undefined){
        return res.status(400).send({
            date: moment().format("YYYYMMDD"),
            success: false
        })
    }
    
    var data = {
            username: req.username,
            password:  req.password,
            date: moment().format('YYYYMMDD'),
            admin: false
        }
    
    pg.connect(conString, function(err, client, done) {
        if(err){
            done();
            return res.status(500).send({
                date: moment().format('YYYYMMDD'),
                succuess: false
            });
        }
        
        var query = client.query("INSERT INTO logins(username, password, date, admin) VALUES($1, $2, $3, $4)", [data.username, data.password, data.date, data.admin]);
        
        query.on('end', function () {
            done();
            return res.status(200).send({
                date: moment().format('YYYYMMDD'),
                success: true
            })
        })
    });  
}