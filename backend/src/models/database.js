const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    database: 'pint', 
    username: 'postgres', 
    password: '1234', 
    host: 'localhost', 
    port: 5432, 
    dialect: 'postgres' 
});

module.exports = sequelize;