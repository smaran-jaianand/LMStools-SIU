import React, { useState } from 'react';
import { Upload, Plus, Trash2, X, RefreshCw } from 'lucide-react';
import ExcelUploader from './ExcelUploader';
import { useCourseStore } from '../../store/courseStore';

export default function CourseDetails() {
    const { courseDetails, setCourseDetails, setStudentData, studentData: globalStudentData } = useCourseStore();
    const [showUploader, setShowUploader] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseDetails({ [name]: value });
    };

    const handleRetrieve = async () => {
        // Fetch student data if course code exists
        if (courseDetails.courseCode) {
            try {
                const response = await fetch(`http://localhost:3000/api/students/${courseDetails.courseCode}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setStudentData(data);
                    } else {
                        alert("No data found for this course code.");
                        setStudentData([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        }
    };

    const handleClearView = () => {
        setStudentData([]);
        setCourseDetails(prev => ({
            ...prev,
            courseCode: '',
            academicYear: '',
            batch: '',
            examSeason: '',
            semester: '',
            credits: '',
            facultyName: '',
            branch: ''
        }));
    };

    const handleSaveStudents = async (dataToSave = globalStudentData, courseInfo = null) => {
        // If courseInfo is provided (from Uploader), update local state
        let currentCourseId = courseDetails.courseCode;
        if (courseInfo) {
            setCourseDetails(prev => ({ ...prev, ...courseInfo }));
            currentCourseId = courseInfo.courseCode || courseDetails.courseCode;
        }

        if (!currentCourseId) {
            alert("Course Code is required to save data.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/students/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: currentCourseId,
                    students: dataToSave
                })
            });

            if (response.ok) {
                setStudentData(dataToSave);
                setShowUploader(false);
                alert('Student data saved successfully!');
            } else {
                alert('Failed to save student data');
            }
        } catch (error) {
            console.error('Error saving students:', error);
            alert('Error saving student data');
        }
    };

    const handleStudentDataChange = (rowIndex, key, value) => {
        const newData = [...globalStudentData];
        newData[rowIndex] = {
            ...newData[rowIndex],
            [key]: value
        };
        setStudentData(newData);
    };

    // Mini Excel Features
    const handleAddRow = () => {
        if (globalStudentData.length === 0) return;
        const firstRowKeys = Object.keys(globalStudentData[0]);
        const newRow = {};
        firstRowKeys.forEach(key => newRow[key] = '');
        setStudentData([...globalStudentData, newRow]);
    };

    const handleRemoveRow = (index) => {
        const newData = globalStudentData.filter((_, i) => i !== index);
        setStudentData(newData);
    };

    const handleAddColumn = () => {
        const columnName = prompt("Enter new column name:");
        if (columnName && globalStudentData.length > 0) {
            const newData = globalStudentData.map(row => ({
                ...row,
                [columnName]: ''
            }));
            setStudentData(newData);
        }
    };

    const handleRemoveColumn = (keyToRemove) => {
        if (confirm(`Are you sure you want to delete column "${keyToRemove}"?`)) {
            const newData = globalStudentData.map(row => {
                const newRow = { ...row };
                delete newRow[keyToRemove];
                return newRow;
            });
            setStudentData(newData);
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Form */}
            <div className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <h2 className="text-xl font-semibold border-b border-border pb-4">Student List Information Input</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Academic Year</label>
                        <input
                            name="academicYear"
                            value={courseDetails.academicYear}
                            onChange={handleChange}
                            type="text"
                            placeholder="2024-25"
                            className="w-full p-2 rounded-md border border-input bg-background"
                            pattern="[0-9]{4}-[0-9]{2}"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Batch</label>
                        <input
                            name="batch"
                            value={courseDetails.batch}
                            onChange={handleChange}
                            type="text"
                            placeholder="2024-28"
                            className="w-full p-2 rounded-md border border-input bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Examination Season</label>
                        <input
                            name="examSeason"
                            value={courseDetails.examSeason}
                            onChange={handleChange}
                            type="month"
                            className="w-full p-2 rounded-md border border-input bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Course Code</label>
                        <input
                            name="courseCode"
                            value={courseDetails.courseCode}
                            onChange={handleChange}
                            type="text"
                            className="w-full p-2 rounded-md border border-input bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Semester</label>
                        <select
                            name="semester"
                            value={courseDetails.semester}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md border border-input bg-background"
                        >
                            <option value="">-- Select --</option>
                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Credits</label>
                        <select
                            name="credits"
                            value={courseDetails.credits}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md border border-input bg-background"
                        >
                            <option value="">-- Select --</option>
                            {[1, 2, 3, 4].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Faculty Name</label>
                        <input
                            name="facultyName"
                            value={courseDetails.facultyName}
                            onChange={handleChange}
                            type="text"
                            className="w-full p-2 rounded-md border border-input bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Branch</label>
                        <select
                            name="branch"
                            value={courseDetails.branch}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md border border-input bg-background"
                        >
                            <option value="">-- Select --</option>
                            {['CSE', 'CST', 'AIML', 'CSE + AIML'].map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                    <button
                        onClick={handleRetrieve}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                        Retrieve Details
                    </button>
                </div>
            </div>

            {/* Retrieved Data Table - Showing Live Store Data */}
            {(courseDetails.courseCode || globalStudentData.length > 0) ? (
                <>
                    <div className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h2 className="text-xl font-semibold">Student List Information Table</h2>
                            <button
                                onClick={handleClearView}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Reset View
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-border">
                            <table className="w-full border-collapse bg-background text-sm">
                                <tbody>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-semibold bg-muted/50 w-1/4 border-r border-border">Academic Year</td>
                                        <td className="p-3 w-1/4 border-r border-border">{courseDetails.academicYear || '-'}</td>
                                        <td className="p-3 font-semibold bg-muted/50 w-1/4 border-r border-border">Batch</td>
                                        <td className="p-3 w-1/4">{courseDetails.batch || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-semibold bg-muted/50 border-r border-border">Examination Season</td>
                                        <td className="p-3 border-r border-border">{courseDetails.examSeason || '-'}</td>
                                        <td className="p-3 font-semibold bg-muted/50 border-r border-border">Course Code</td>
                                        <td className="p-3">{courseDetails.courseCode || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-semibold bg-muted/50 border-r border-border">Semester</td>
                                        <td className="p-3 border-r border-border">{courseDetails.semester || '-'}</td>
                                        <td className="p-3 font-semibold bg-muted/50 border-r border-border">Credits</td>
                                        <td className="p-3">{courseDetails.credits || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-semibold bg-muted/50 border-r border-border">Branch</td>
                                        <td colSpan="3" className="p-3">{courseDetails.branch || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-semibold bg-muted/50 border-r border-border">Faculty Name</td>
                                        <td colSpan="3" className="p-3">{courseDetails.facultyName || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Student Data Section */}
                    <div className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h2 className="text-xl font-semibold">Student Data</h2>
                            <div className="flex gap-2">
                                <button onClick={handleAddColumn} className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded">
                                    <Plus className="w-3 h-3" /> Col
                                </button>
                                <button onClick={handleAddRow} className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded">
                                    <Plus className="w-3 h-3" /> Row
                                </button>
                                <button
                                    onClick={() => handleSaveStudents(globalStudentData)}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {globalStudentData && globalStudentData.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full border-collapse bg-background text-sm">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="p-3 w-10 text-center text-muted-foreground">#</th>
                                            {Object.keys(globalStudentData[0] || {}).map((header, i) => (
                                                <th key={i} className="p-3 text-left font-semibold border-r border-border last:border-r-0 whitespace-nowrap group relative">
                                                    {header}
                                                    <button
                                                        onClick={() => handleRemoveColumn(header)}
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-0.5 rounded"
                                                        title="Remove Column"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </th>
                                            ))}
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {globalStudentData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                                                <td className="p-3 text-center text-muted-foreground">{rowIndex + 1}</td>
                                                {Object.entries(row).map(([key, cell], colIndex) => (
                                                    <td key={colIndex} className="p-2 border-r border-border last:border-r-0 min-w-[150px]">
                                                        <input
                                                            value={cell || ''}
                                                            onChange={(e) => handleStudentDataChange(rowIndex, key, e.target.value)}
                                                            className="w-full bg-transparent p-1 rounded hover:bg-background focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveRow(rowIndex)}
                                                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                                        title="Remove Row"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No student data available. Upload an Excel file to populate this table or Retrieve existing data.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/10 border-2 border-dashed border-border rounded-lg text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-4 bg-muted mb-4 rounded-full">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Data Displayed</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Enter a Course Code and click "Retrieve Details" to view student information, or upload a new Excel file to get started.
                    </p>
                </div>
            )}

            {/* Previously: Student List Info Table was separate. Now merged into conditional block above */}
            {/* Removing original separate blocks to avoid duplication */}

            {showUploader && (
                <ExcelUploader
                    onSave={handleSaveStudents}
                    onClose={() => setShowUploader(false)}
                />
            )}
        </div>
    );
}
