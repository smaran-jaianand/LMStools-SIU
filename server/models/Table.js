const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Table = sequelize.define('Table', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Untitled Table',
    },
    data: {
        type: DataTypes.JSON, // Stores rows, cols, merges, cells, etc.
        allowNull: false,
    },
});

module.exports = Table;
