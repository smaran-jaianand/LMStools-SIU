import React, { useState } from 'react';
import { Upload } from 'lucide-react';
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
                    }
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        }
    };

    const handleSaveStudents = async (data) => {
        try {
            const response = await fetch('http://localhost:3000/api/students/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: courseDetails.courseCode,
                    students: data
                })
            });

            if (response.ok) {
                setStudentData(data);
                setShowUploader(false);
            } else {
                alert('Failed to save student data');
            }
        } catch (error) {
            console.error('Error saving students:', error);
            alert('Error saving student data');
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
                        onClick={() => setShowUploader(true)}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/80 transition-colors font-medium"
                    >
                        <Upload className="w-4 h-4" /> Upload Excel
                    </button>
                    <button
                        onClick={handleRetrieve}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                        Retrieve Details
                    </button>
                </div>
            </div>

            {/* Retrieved Data Table - Showing Live Store Data */}
            {(courseDetails.courseCode || courseDetails.academicYear) && (
                <div className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-semibold border-b border-border pb-4">Student List Information Table</h2>

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
            )}

            {/* Student Data Section */}
            {true && (
                <div className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <h2 className="text-xl font-semibold">Student Data</h2>
                    </div>

                    {globalStudentData && globalStudentData.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full border-collapse bg-background text-sm">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        {Object.keys(globalStudentData[0] || {}).map((header, i) => (
                                            <th key={i} className="p-3 text-left font-semibold border-r border-border last:border-r-0 whitespace-nowrap">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {globalStudentData.map((row, i) => (
                                        <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                                            {Object.values(row).map((cell, j) => (
                                                <td key={j} className="p-3 border-r border-border last:border-r-0 whitespace-nowrap">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No student data available. Upload an Excel file to populate this table.
                        </div>
                    )}
                </div>
            )}

            {showUploader && (
                <ExcelUploader
                    onSave={handleSaveStudents}
                    onClose={() => setShowUploader(false)}
                />
            )}
        </div>
    );
}
