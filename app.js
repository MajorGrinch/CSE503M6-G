var Sequelize = require('sequelize'), config = require('./config');

var seq = new Sequelize(config.database, config.username, config.password, {
	host: config.host,
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

seq.authenticate()
	.then(()=>{
		console.log("connect successfully.");
	})
	.catch(err => {
		console.log("connect failed.");
	});

var User = seq.define('user', {
	userid: {
		type: Sequelize.BIGINT,
		primaryKey: true
	},
	username: Sequelize.STRING(25),
	password: Sequelize.STRING(255)
}, {
	timestamps: false
});

(async() => {
	var a = await User.create({
		username: 'Kirk',
		password: '1234567'
	});
	console.log(JSON.stringify(a));
})();