import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Trash2, Plus } from 'lucide-react';
import EditDataDialog from '../components/CourseBuilder/EditDataDialog';
import ExcelUploader from '../components/CourseBuilder/ExcelUploader';

export default function ImportedDataPage() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploader, setShowUploader] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/students/list/courses');
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const handleDelete = async (e, courseId) => {
        e.stopPropagation(); // Prevent opening the edit dialog
        if (confirm(`Are you sure you want to delete all data for ${courseId}? This action cannot be undone.`)) {
            try {
                const res = await fetch(`http://localhost:3000/api/students/${courseId}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    fetchCourses(); // Refresh list
                } else {
                    alert("Failed to delete course");
                }
            } catch (error) {
                console.error("Error deleting course", error);
                alert("Error deleting course");
            }
        }
    };

    const handleImportSave = async (data, courseInfo) => {
        // Logic similar to CourseDetails handleSaveStudents but we need to ensure we call the API
        // The ExcelUploader onSave gives us (data, courseInfo)
        if (!courseInfo || !courseInfo.courseCode) {
            alert("Course Code is required.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/students/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: courseInfo.courseCode,
                    students: data
                })
            });

            if (response.ok) {
                alert('Data imported successfully!');
                setShowUploader(false);
                fetchCourses(); // Refresh the list
            } else {
                alert('Failed to save imported data');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving data');
        }
    };

    const filteredCourses = courses.filter(c =>
        c.courseId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Imported Data Management</h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full p-2 border border-input rounded-md bg-background"
                        />
                    </div>
                    <button
                        onClick={() => setShowUploader(true)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Import New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                    <div
                        key={course.courseId}
                        onClick={() => setSelectedCourse(course.courseId)}
                        className="bg-card hover:bg-accent/50 cursor-pointer border border-border p-6 rounded-lg shadow-sm transition-all group relative"
                    >
                        <button
                            onClick={(e) => handleDelete(e, course.courseId)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Course"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{course.courseId}</h3>
                                <p className="text-xs text-muted-foreground">Click to edit data</p>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCourses.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/5">
                        <FileSpreadsheet className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No imported data found</p>
                        <button
                            onClick={() => setShowUploader(true)}
                            className="text-primary hover:underline flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Data Sources
                        </button>
                    </div>
                )}
            </div>

            <EditDataDialog
                courseId={selectedCourse}
                isOpen={!!selectedCourse}
                onClose={() => {
                    setSelectedCourse(null);
                    fetchCourses(); // Refresh after close in case of changes
                }}
            />

            {showUploader && (
                <ExcelUploader
                    onSave={handleImportSave}
                    onClose={() => setShowUploader(false)}
                />
            )}
        </div>
    );
}
