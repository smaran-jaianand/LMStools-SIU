import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, Save, Edit } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';

export default function QuestionPaper() {
    const { courseDetails, studentData, questions, setQuestions, questionMarks, setQuestionMark } = useCourseStore();
    const componentRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isMarksSaved, setIsMarksSaved] = useState(true);
    // Local questions state removed to use global store

    const handleQuestionChange = (id, field, value) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: questions.length + 1,
            text: '',
            marks: '',
            co: '',
            bl: ''
        }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions.map((q, i) => ({ ...q, id: i + 1 })));
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
                a.download = 'question-paper.pdf';
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

    return (
        <div ref={componentRef} className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm">

            {/* Course Details Header */}
            {(courseDetails.courseCode || courseDetails.academicYear) && (
                <div className="mb-6 bg-muted/30 p-4 rounded-md border border-border">
                    <h3 className="font-semibold text-lg mb-2 text-primary">Course Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-medium">Year:</span> {courseDetails.academicYear || '-'}</div>
                        <div><span className="font-medium">Course:</span> {courseDetails.courseCode || '-'}</div>
                        <div><span className="font-medium">Sem:</span> {courseDetails.semester || '-'}</div>
                        <div><span className="font-medium">Branch:</span> {courseDetails.branch || '-'}</div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center border-b border-border pb-4">
                <h2 className="text-xl font-semibold">End Sem Question Paper</h2>
                <div className="flex gap-2 print-hidden">
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

            {/* Student List Table */}
            <div className="mt-8 border-t border-border pt-6 break-before-page">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Student List vs Marks</h3>
                    <div className="print-hidden">
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
                    <table className="w-full border-collapse bg-background text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-3 text-left font-semibold border-r border-border">S.No</th>
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
                            {studentData && studentData.length > 0 ? (
                                studentData.map((student, i) => (
                                    <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                                        <td className="p-3 border-r border-border w-16 text-center">{i + 1}</td>
                                        <td className="p-3 border-r border-border">{Object.values(student)[0] || '-'}</td>
                                        <td className="p-3 border-r border-border">{Object.values(student)[1] || '-'}</td>
                                        {/* Dynamic Cells for Questions */}
                                        {questions.map((q) => (
                                            <td key={q.id} className="p-3 border-r border-border text-center min-w-[80px]">
                                                {isMarksSaved ? (
                                                    <span>{(questionMarks[i] && questionMarks[i][q.id]) || '-'}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={(questionMarks[i] && questionMarks[i][q.id]) || ''}
                                                        onChange={(e) => setQuestionMark(i, q.id, e.target.value)}
                                                        className="w-full text-center p-1 border rounded-md"
                                                        placeholder=""
                                                    />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                // Mock Data Fallback
                                [1, 2, 3, 4, 5].map((num, i) => (
                                    <tr key={num} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                                        <td className="p-3 border-r border-border w-16 text-center">{num}</td>
                                        <td className="p-3 border-r border-border">21A91A050{num}</td>
                                        <td className="p-3 border-r border-border">Sample Student {num}</td>
                                        {questions.map((q) => (
                                            <td key={q.id} className="p-3 border-r border-border text-center min-w-[80px]">
                                                {isMarksSaved ? (
                                                    <span>{(questionMarks[i] && questionMarks[i][q.id]) || '-'}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={(questionMarks[i] && questionMarks[i][q.id]) || ''}
                                                        onChange={(e) => setQuestionMark(i, q.id, e.target.value)}
                                                        className="w-full text-center p-1 border rounded-md"
                                                        placeholder=""
                                                    />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {(!studentData || studentData.length === 0) && (
                        <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20">
                            (Sample data shown - Upload student list in "Student List Information" to populate real data)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
