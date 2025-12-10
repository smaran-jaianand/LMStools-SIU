const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const Student = require('../models/Student');

const upload = multer({ storage: multer.memoryStorage() });

// Upload and parse Excel file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.worksheets[0];
        const jsonData = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            // row.values is 1-based array, so slice(1) to get actual values
            const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
            jsonData.push(rowValues);
        });

        res.json({ data: jsonData });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});

// Save student data
router.post('/save', async (req, res) => {
    try {
        const { courseId, students } = req.body;

        if (!courseId || !students) {
            return res.status(400).json({ error: 'Missing courseId or students data' });
        }

        // Clear existing data for this course (optional, depending on requirement)
        await Student.destroy({ where: { courseId } });

        // Bulk create
        const studentRecords = students.map(student => ({
            courseId,
            data: student
        }));

        await Student.bulkCreate(studentRecords);

        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Get students by courseId
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const students = await Student.findAll({ where: { courseId } });

        // Return just the data arrays
        const data = students.map(s => s.data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Get list of all courses
router.get('/list/courses', async (req, res) => {
    try {
        // Group by courseId to get distinct courses
        const courses = await Student.findAll({
            attributes: ['courseId'],
            group: ['courseId']
        });

        // In a real app we might want more metadata, but for now just the IDs
        res.json(courses.map(c => ({ courseId: c.courseId })));
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Delete course data
router.delete('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        await Student.destroy({ where: { courseId } });
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

module.exports = router;
