const express = require('express');
const Table = require('../models/Table');
const router = express.Router();

// Create or Update Table
router.post('/save', async (req, res) => {
    try {
        const { id, name, data } = req.body;
        let table;
        if (id) {
            table = await Table.findByPk(id);
            if (table) {
                table.name = name || table.name;
                table.data = data;
                await table.save();
            }
        }

        if (!table) {
            table = await Table.create({ name, data });
        }

        res.json(table);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Table
router.get('/:id', async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);
        if (!table) return res.status(404).json({ error: 'Table not found' });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.findAll({ attributes: ['id', 'name', 'updatedAt'] });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
