const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    headers: {
        type: DataTypes.JSON, // Stores array of strings: ['Col1', 'Col2', ...]
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON, // For future use (academicYear, etc.)
        allowNull: true
    }
});

module.exports = Course;
