import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, Save, Edit, ClipboardList } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { getStudentDisplayInfo } from '../../utils/studentHelpers';
import EmptyState from '../EmptyState';

export default function QuestionPaper() {
    const {
        courseDetails,
        studentData,
        questionPapers,
        addQuestionPaper,
        removeQuestionPaper,
        updateQuestionPaperName,
        setQuestionPaperQuestions,
        setQuestionPaperMark
    } = useCourseStore();

    const componentRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isMarksSaved, setIsMarksSaved] = useState(true);

    // View state: 'list' -> 'options' -> 'builder' | 'marks'
    const [viewMode, setViewMode] = useState('list');
    const [selectedQpId, setSelectedQpId] = useState(null);

    // Helpers to get current QP data
    const currentQp = selectedQpId
        ? questionPapers.find(q => q.id === selectedQpId)
        : null;

    const questions = currentQp ? currentQp.questions : [];
    const questionMarks = currentQp ? currentQp.marks : {};

    const handleQuestionChange = (id, field, value) => {
        if (!currentQp) return;
        const newQuestions = questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        );
        setQuestionPaperQuestions(currentQp.id, newQuestions);
    };

    const addQuestion = () => {
        if (!currentQp) return;
        const newQuestions = [...questions, {
            id: questions.length + 1,
            text: '',
            marks: '',
            co: '',
            bl: ''
        }];
        setQuestionPaperQuestions(currentQp.id, newQuestions);
    };

    const removeQuestion = (index) => {
        if (!currentQp) return;
        const newQuestions = questions.filter((_, i) => i !== index)
            .map((q, i) => ({ ...q, id: i + 1 }));
        setQuestionPaperQuestions(currentQp.id, newQuestions);
    };

    const handleAddQp = () => {
        const name = prompt("Enter Question Paper Name (e.g., Make-up Exam):");
        if (name) {
            addQuestionPaper(name);
        }
    };

    const handleDeleteQp = (e, id) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this Question Paper?")) {
            removeQuestionPaper(id);
            if (selectedQpId === id) {
                setViewMode('list');
                setSelectedQpId(null);
            }
        }
    };

    const handleEditName = (currentName) => {
        const newName = prompt("Edit Question Paper Name:", currentName);
        if (newName && currentQp) {
            updateQuestionPaperName(currentQp.id, newName);
        }
    }

    const handleEditNameFromList = (e, id, currentName) => {
        e.stopPropagation();
        const newName = prompt("Edit Question Paper Name:", currentName);
        if (newName) {
            updateQuestionPaperName(id, newName);
        }
    }

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
                a.download = `question-paper-${currentQp?.name || 'export'}.pdf`;
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
    const NavBlock = ({ title, subtitle, icon: Icon, onClick, onDelete, onEdit }) => (
        <div
            onClick={onClick}
            className="bg-card hover:bg-accent/50 cursor-pointer border border-border p-6 rounded-lg shadow-sm transition-all group relative"
        >
            {(onDelete || onEdit) && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                            title="Edit Name"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
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
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={handleAddQp}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                >
                    <Plus size={16} /> Add New QP
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {questionPapers.map(qp => (
                    <NavBlock
                        key={qp.id}
                        title={qp.name}
                        subtitle="Manage Question Paper and Marks"
                        icon={FileText}
                        onClick={() => {
                            setSelectedQpId(qp.id);
                            setViewMode('options');
                        }}
                        onEdit={(e) => handleEditNameFromList(e, qp.id, qp.name)}
                        onDelete={(e) => handleDeleteQp(e, qp.id)}
                    />
                ))}
                {questionPapers.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No Question Papers created. Click "Add New QP" to start.
                    </div>
                )}
            </div>
        </div>
    );

    const renderOptions = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <button onClick={() => {
                    setViewMode('list');
                    setSelectedQpId(null);
                }} className="text-muted-foreground hover:text-primary">
                    &larr; Back to List
                </button>
                <div className="flex items-center gap-2 group">
                    <h2 className="text-xl font-semibold">{currentQp?.name}</h2>
                    <button
                        onClick={() => handleEditName(currentQp?.name)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-opacity"
                        title="Edit Name"
                    >
                        <Edit size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NavBlock
                    title="QP Builder"
                    subtitle="Create and edit questions"
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
                    <div className="flex items-center gap-2 group">
                        <h2 className="text-xl font-semibold">{currentQp?.name} - Builder</h2>
                        <button
                            onClick={() => handleEditName(currentQp?.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-opacity"
                            title="Edit Name"
                        >
                            <Edit size={16} />
                        </button>
                    </div>
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
                            onClick={addQuestion}
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
                        {questions.map((q, index) => (
                            <tr key={index}>
                                <td className="border border-border p-3 font-medium">Q{q.id}</td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 whitespace-pre-wrap">{q.text || '-'}</div>
                                    ) : (
                                        <textarea
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                            placeholder="Enter Question here..."
                                            className="w-full p-2 rounded-md border border-input bg-background min-h-[60px] resize-y"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 text-center">{q.marks || '-'}</div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={q.marks}
                                            onChange={(e) => handleQuestionChange(q.id, 'marks', e.target.value)}
                                            placeholder="Marks"
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 text-center">{q.co || '-'}</div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={q.co}
                                            onChange={(e) => handleQuestionChange(q.id, 'co', e.target.value)}
                                            placeholder="e.g. CO1"
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3">
                                    {isSaved ? (
                                        <div className="p-2 text-center">{q.bl || '-'}</div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={q.bl}
                                            onChange={(e) => handleQuestionChange(q.id, 'bl', e.target.value)}
                                            placeholder="e.g. L2"
                                            className="w-full p-2 rounded-md border border-input bg-background"
                                        />
                                    )}
                                </td>
                                <td className="border border-border p-3 text-center">
                                    {!isSaved && (
                                        <button
                                            onClick={() => removeQuestion(index)}
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
                    <div className="flex items-center gap-2 group">
                        <h3 className="text-xl font-semibold">{currentQp?.name} - Marks</h3>
                        <button
                            onClick={() => handleEditName(currentQp?.name)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-opacity"
                            title="Edit Name"
                        >
                            <Edit size={16} />
                        </button>
                    </div>
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
                                    {/* Dynamic Question Columns */}
                                    {questions.map((q) => (
                                        <th key={q.id} className="p-3 text-center font-semibold border-r border-border w-16">
                                            Q{q.id} ({q.marks || '-'})
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
                                            {/* Dynamic Cells for Questions */}
                                            {questions.map((q) => (
                                                <td key={q.id} className="p-3 border-r border-border text-center min-w-[80px]">
                                                    {isMarksSaved ? (
                                                        <span>{(questionMarks[i] && questionMarks[i][q.id]) || '-'}</span>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={(questionMarks[i] && questionMarks[i][q.id]) || ''}
                                                            onChange={(e) => setQuestionPaperMark(currentQp.id, i, q.id, e.target.value)}
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
