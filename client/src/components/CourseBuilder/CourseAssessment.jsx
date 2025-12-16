import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, Save, Edit } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { getStudentDisplayInfo } from '../../utils/studentHelpers';
import EmptyState from '../EmptyState';

export default function CourseAssessment() {
    // Using 'assessments' and 'assessmentMarks' instead of 'questions' and 'questionMarks'
    const { courseDetails, studentData, assessments, setAssessments, assessmentMarks, setAssessmentMark } = useCourseStore();
    const componentRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isMarksSaved, setIsMarksSaved] = useState(true);

    // View state: 'list' -> 'options' -> 'builder' | 'marks'
    const [viewMode, setViewMode] = useState('list');

    const handleAssessmentChange = (id, field, value) => {
        setAssessments(assessments.map(a =>
            a.id === id ? { ...a, [field]: value } : a
        ));
    };

    const addAssessment = () => {
        setAssessments([...assessments, {
            id: assessments.length + 1,
            text: '',
            marks: '',
            co: '',
            bl: ''
        }]);
    };

    const removeAssessment = (index) => {
        const newAssessments = assessments.filter((_, i) => i !== index);
        setAssessments(newAssessments.map((a, i) => ({ ...a, id: i + 1 })));
    };

    const handleExportPDF = async () => {
        if (!componentRef.current) return;
        setIsExporting(true);
        try {
            const htmlContent = componentRef.current.innerHTML;
            const response = await fetch('http://localhost:3000/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: htmlContent,
                    css: '.print-hidden { display: none !important; }'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'course-assessment.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error('Failed to export PDF');
                alert('Failed to export PDF');
            }
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error exporting PDF');
        } finally {
            setIsExporting(false);
        }
    };

    // Navigation Block Component
    const NavBlock = ({ title, subtitle, icon: Icon, onClick }) => (
        <div
            onClick={onClick}
            className="bg-card hover:bg-accent/50 cursor-pointer border border-border p-6 rounded-lg shadow-sm transition-all group relative"
        >
            <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </div>
        </div>
    );

    // --- VIEW Render Functions ---

    const renderList = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NavBlock
                title="Course Assessment"
                subtitle="Manage Assessment and Marks"
                icon={FileText}
                onClick={() => setViewMode('options')}
            />
        </div>
    );

    const renderOptions = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('list')} className="text-muted-foreground hover:text-primary">
                    &larr; Back to List
                </button>
                <h2 className="text-xl font-semibold">Course Assessment</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NavBlock
                    title="Assessment Builder"
                    subtitle="Create and edit assessments"
                    icon={Edit}
                    onClick={() => setViewMode('builder')}
                />
                <NavBlock
                    title="Student Marks Table"
                    subtitle="Entry marks for students"
                    icon={FileText}
                    onClick={() => setViewMode('marks')}
                />
            </div>
        </div>
    );

    const renderBuilder = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4 print-hidden">
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('options')} className="text-muted-foreground hover:text-primary">
                        &larr; Back
                    </button>
                    <h2 className="text-xl font-semibold">Assessment Builder</h2>
                </div>
                <div className="flex gap-2">
                    {!isSaved ? (
                        <button
                            onClick={() => setIsSaved(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                            <Save size={16} /> Save
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsSaved(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                        >
                            <Edit size={16} /> Edit
                        </button>
                    )}
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting || !isSaved}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 disabled:opacity-50"
                        title={!isSaved ? "Save changes to export" : "Export to PDF"}
                    >
                        <FileText size={16} /> {isExporting ? 'Exporting...' : 'Convert to PDF'}
                    </button>
                    {!isSaved && (
                        <button
                            onClick={addAssessment}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                        >
                            <Plus size={16} /> Add Question
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted/50">
                            <th className="border border-border p-3 text-left w-20">Q. No</th>
                            <th className="border border-border p-3 text-left">Question</th>
                            <th className="border border-border p-3 text-left w-24">Marks</th>
                            <th className="border border-border p-3 text-left w-32">CO Map</th>
                            <th className="border border-border p-3 text-left w-24">BL</th>
                            <th className="border border-border p-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {assessments.map((a, index) => (
                            <tr key={index}>
                                <td className="border border-border p-3 font-medium">Q{a.id}</td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 whitespace-pre-wrap">{a.text || '-'}</div>
                                    ) : (
                                        <textarea
                                            value={a.text}
                                            onChange={(e) => handleAssessmentChange(a.id, 'text', e.target.value)}
                                            placeholder="Enter Question here..."
                                            className="w-full p-2 rounded-md border border-input bg-background min-h-[60px] resize-y"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 text-center">{a.marks || '-'}</div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={a.marks}
                                            onChange={(e) => handleAssessmentChange(a.id, 'marks', e.target.value)}
                                            placeholder="Marks"
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 text-center">{a.co || '-'}</div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={a.co}
                                            onChange={(e) => handleAssessmentChange(a.id, 'co', e.target.value)}
                                            placeholder="e.g. CO1"
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 text-center">{a.bl || '-'}</div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={a.bl}
                                            onChange={(e) => handleAssessmentChange(a.id, 'bl', e.target.value)}
                                            placeholder="e.g. L2"
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3 text-center">
                                    {!isSaved && (
                                        <button
                                            onClick={() => removeAssessment(index)}
                                            className="text-destructive hover:bg-destructive/10 p-2 rounded-md"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMarks = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4 print-hidden">
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('options')} className="text-muted-foreground hover:text-primary">
                        &larr; Back
                    </button>
                    <h3 className="text-xl font-semibold">Student List vs Marks</h3>
                </div>
                <div>
                    {!isMarksSaved ? (
                        <button
                            onClick={() => setIsMarksSaved(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                            <Save size={16} /> Save Marks
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsMarksSaved(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                        >
                            <Edit size={16} /> Edit Marks
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <div className="overflow-x-auto rounded-lg border border-border">
                    {studentData && studentData.length > 0 ? (
                        <table className="w-full border-collapse bg-background text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="p-3 text-left font-semibold border-r border-border w-16">S.No</th>
                                    <th className="p-3 text-left font-semibold border-r border-border">Roll Number</th>
                                    <th className="p-3 text-left font-semibold border-r border-border">Student Name</th>
                                    {/* Dynamic Assessment Columns */}
                                    {assessments.map((a) => (
                                        <th key={a.id} className="p-3 text-center font-semibold border-r border-border w-16">
                                            Q{a.id} ({a.marks || '-'})
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.map((student, i) => {
                                    const { rollNumber, name } = getStudentDisplayInfo(student);
                                    return (
                                        <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                                            <td className="p-3 border-r border-border w-16 text-center">{i + 1}</td>
                                            <td className="p-3 border-r border-border">{rollNumber || '-'}</td>
                                            <td className="p-3 border-r border-border">{name || '-'}</td>
                                            {/* Dynamic Cells for Assessments */}
                                            {assessments.map((a) => (
                                                <td key={a.id} className="p-3 border-r border-border text-center min-w-[80px]">
                                                    {isMarksSaved ? (
                                                        <span>{(assessmentMarks[i] && assessmentMarks[i][a.id]) || '-'}</span>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={(assessmentMarks[i] && assessmentMarks[i][a.id]) || ''}
                                                            onChange={(e) => setAssessmentMark(i, a.id, e.target.value)}
                                                            className="w-full text-center p-1 border rounded-md"
                                                            placeholder=""
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            message="No student data available. Please retrieve or upload student data in the Course Details page."
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div ref={componentRef} className="bg-card p-6 rounded-lg border border-border shadow-sm">
            {/* Course Details Header */}
            {(courseDetails.courseCode || courseDetails.academicYear) && (
                <div className="mb-6 bg-muted/30 p-4 rounded-md border border-border print-hidden">
                    <h3 className="font-semibold text-lg mb-2 text-primary">Course Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-medium">Year:</span> {courseDetails.academicYear || '-'}</div>
                        <div><span className="font-medium">Course:</span> {courseDetails.courseCode || '-'}</div>
                        <div><span className="font-medium">Sem:</span> {courseDetails.semester || '-'}</div>
                        <div><span className="font-medium">Branch:</span> {courseDetails.branch || '-'}</div>
                    </div>
                </div>
            )}

            {viewMode === 'list' && renderList()}
            {viewMode === 'options' && renderOptions()}
            {viewMode === 'builder' && renderBuilder()}
            {viewMode === 'marks' && renderMarks()}
        </div>
    );
}
