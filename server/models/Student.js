const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    courseId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSON, // Stores the entire row data as JSON
        allowNull: false,
    }
});

module.exports = Student;
