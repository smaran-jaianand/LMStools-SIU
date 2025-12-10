import React, { useState, useRef } from 'react';
import { Upload, X, Save, Plus, Trash2 } from 'lucide-react';
import ExcelJS from 'exceljs';

export default function ExcelUploader({ onSave, onClose }) {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);

        try {
            const workbook = new ExcelJS.Workbook();
            const arrayBuffer = await file.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.worksheets[0];
            const jsonData = [];

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                // row.values is 1-based array, so slice(1) to get actual values
                // However, exceljs might return sparse arrays or objects depending on content
                // We need to ensure we get a clean array of strings/values
                const rowValues = [];
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    let value = cell.value;

                    // Handle objects (rich text, formulas, hyperlinks)
                    if (typeof value === 'object' && value !== null) {
                        if (value.richText) {
                            value = value.richText.map(t => t.text).join('');
                        } else if (value.result !== undefined) {
                            value = value.result;
                        } else if (value.text) {
                            value = value.text;
                        } else if (value.hyperlink) {
                            value = value.text || value.hyperlink;
                        } else {
                            // Fallback for unknown objects
                            value = JSON.stringify(value);
                        }
                    }

                    // index is 0-based for our array, colNumber is 1-based
                    rowValues[colNumber - 1] = value !== undefined && value !== null ? String(value) : '';
                });

                // Fill in gaps if row.eachCell skips empty cells despite includeEmpty:true (safety)
                // or if the row is shorter than the header row (handled later if needed, but for now push)
                jsonData.push(rowValues);
            });

            if (jsonData.length > 0) {
                let extractedHeaders = jsonData[0];

                // If headers are sparse (lots of empty strings), or we suspect the first row isn't a good header,
                // we might need to normalize. For now, let's just ensure we capture all columns.
                // Find the max length based on other rows if possible, or just trust the first row

                // Find the max number of columns in any row
                const maxColumns = jsonData.reduce((max, row) => Math.max(max, row.length), extractedHeaders.length);

                // Ensure extractedHeaders is long enough
                const cleanedHeaders = [...extractedHeaders];
                for (let i = 0; i < maxColumns; i++) {
                    if (!cleanedHeaders[i] || String(cleanedHeaders[i]).trim() === '') {
                        cleanedHeaders[i] = `Column ${i + 1}`;
                    } else {
                        cleanedHeaders[i] = String(cleanedHeaders[i]);
                    }
                }

                setHeaders(cleanedHeaders);

                // Align data
                const alignedData = jsonData.slice(1).map(row => {
                    const newRow = [...row];
                    // Pad if short
                    while (newRow.length < maxColumns) {
                        newRow.push('');
                    }
                    return newRow;
                });

                setData(alignedData);
            }
        } catch (error) {
            console.error('Error reading Excel file:', error);
            alert('Failed to read Excel file. Please ensure it is a valid .xlsx file.');
        }
    };

    const handleCellChange = (rowIndex, colIndex, value) => {
        const newData = [...data];
        newData[rowIndex][colIndex] = value;
        setData(newData);
    };

    const handleHeaderChange = (colIndex, value) => {
        const newHeaders = [...headers];
        newHeaders[colIndex] = value;
        setHeaders(newHeaders);
    };

    const addRow = () => {
        const newRow = new Array(headers.length).fill('');
        setData([...data, newRow]);
    };

    const removeRow = (index) => {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
    };

    const addColumn = () => {
        setHeaders([...headers, `Column ${headers.length + 1}`]);
        const newData = data.map(row => [...row, '']);
        setData(newData);
    };

    const removeColumn = (index) => {
        const newHeaders = headers.filter((_, i) => i !== index);
        const newData = data.map(row => row.filter((_, i) => i !== index));
        setHeaders(newHeaders);
        setData(newData);
    };

    const [courseInfo, setCourseInfo] = useState({
        academicYear: '',
        batch: '',
        examSeason: '',
        courseCode: '',
        semester: '',
        credits: '',
        facultyName: '',
        branch: ''
    });

    const handleCourseInfoChange = (e) => {
        const { name, value } = e.target;
        setCourseInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Convert to array of objects for better compatibility with the app
        const formattedData = data.map(row => {
            const obj = {};
            headers.forEach((header, i) => {
                if (header) {
                    obj[header] = row[i] || '';
                }
            });
            return obj;
        });
        onSave(formattedData, courseInfo);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background w-full max-w-6xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-semibold">Upload & Customize Student Data</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Course Info Form in Preview */}
                    <div className="bg-muted/10 p-4 rounded-lg border border-border mb-6">
                        <h3 className="text-sm font-semibold mb-3">Course Details (Required for linking data)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input name="academicYear" placeholder="Academic Year" value={courseInfo.academicYear} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm" />
                            <input name="batch" placeholder="Batch" value={courseInfo.batch} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm" />
                            <input name="examSeason" type="month" value={courseInfo.examSeason} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm" />
                            <input name="courseCode" placeholder="Course Code" value={courseInfo.courseCode} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm font-semibold" required />
                            <select name="semester" value={courseInfo.semester} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm">
                                <option value="">Semester</option>
                                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select name="credits" value={courseInfo.credits} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm">
                                <option value="">Credits</option>
                                {[1, 2, 3, 4].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input name="facultyName" placeholder="Faculty Name" value={courseInfo.facultyName} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm" />
                            <select name="branch" value={courseInfo.branch} onChange={handleCourseInfoChange} className="p-2 border rounded text-sm">
                                <option value="">Branch</option>
                                {['CSE', 'CST', 'AIML', 'CSE + AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    {!data.length ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">Upload an Excel file (.xlsx) to get started</p>
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileUpload}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                            >
                                Select File
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">File:</span>
                                    <span className="text-muted-foreground">{fileName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={addColumn} className="flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80">
                                        <Plus className="w-4 h-4" /> Add Column
                                    </button>
                                    <button onClick={addRow} className="flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80">
                                        <Plus className="w-4 h-4" /> Add Row
                                    </button>
                                </div>
                            </div>

                            <div className="border border-border rounded-lg overflow-auto max-h-[60vh]">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="p-2 border border-border w-10">#</th>
                                            {headers.map((header, i) => (
                                                <th key={i} className="p-2 border border-border min-w-[150px] relative group">
                                                    <input
                                                        value={header}
                                                        onChange={(e) => handleHeaderChange(i, e.target.value)}
                                                        className="bg-transparent w-full font-semibold focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={() => removeColumn(i)}
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 text-destructive rounded"
                                                        title="Remove Column"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </th>
                                            ))}
                                            <th className="p-2 border border-border w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-muted/20">
                                                <td className="p-2 border border-border text-center text-muted-foreground">{rowIndex + 1}</td>
                                                {row.map((cell, colIndex) => (
                                                    <td key={colIndex} className="p-2 border border-border min-w-[150px]">
                                                        <input
                                                            value={cell || ''}
                                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                            className="w-full bg-transparent focus:outline-none focus:bg-background/50 rounded px-1"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-2 border border-border text-center">
                                                    <button
                                                        onClick={() => removeRow(rowIndex)}
                                                        className="p-1 hover:bg-destructive/10 text-destructive rounded"
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
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-muted transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!data.length}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> Save Data
                    </button>
                </div>
            </div>
        </div>
    );
}
