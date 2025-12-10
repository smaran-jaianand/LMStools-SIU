import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function EditDataDialog({ courseId, isOpen, onClose }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && courseId) {
            fetchData();
        }
    }, [isOpen, courseId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/students/${courseId}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/students/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: courseId,
                    students: data
                })
            });

            if (response.ok) {
                alert('Data saved successfully!');
                onClose();
            } else {
                alert('Failed to save data');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving data');
        }
    };

    const handleChange = (rowIndex, key, value) => {
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [key]: value };
        setData(newData);
    };

    const handleAddRow = () => {
        if (data.length === 0) return;
        const keys = Object.keys(data[0]);
        const newRow = {};
        keys.forEach(k => newRow[k] = '');
        setData([...data, newRow]);
    };

    const handleRemoveRow = (index) => {
        setData(data.filter((_, i) => i !== index));
    };

    const handleAddColumn = () => {
        const name = prompt("Enter column name:");
        if (name) {
            setData(data.map(row => ({ ...row, [name]: '' })));
        }
    };

    const handleRemoveColumn = (key) => {
        if (confirm(`Delete column ${key}?`)) {
            const newData = data.map(row => {
                const newRow = { ...row };
                delete newRow[key];
                return newRow;
            });
            setData(newData);
        }
    };

    // Derived headers from all rows to ensure we show all columns
    const allHeaders = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const uniqueKeys = new Set();
        data.forEach(row => {
            Object.keys(row).forEach(k => uniqueKeys.add(k));
        });
        // Sort or prioritize known headers? For now just array
        return Array.from(uniqueKeys);
    }, [data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background w-full max-w-6xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-semibold">Editing: {courseId}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                <button onClick={handleAddColumn} className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded">
                                    <Plus className="w-3 h-3" /> Add Column
                                </button>
                                <button onClick={handleAddRow} className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded">
                                    <Plus className="w-3 h-3" /> Add Row
                                </button>
                            </div>

                            {data.length > 0 && (
                                <div className="overflow-x-auto border border-border rounded-lg">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="p-3 w-10 text-center text-muted-foreground">#</th>
                                                {allHeaders.map((header, i) => (
                                                    <th key={i} className="p-3 text-left font-semibold border-r border-border min-w-[150px] group relative">
                                                        {header}
                                                        <button
                                                            onClick={() => handleRemoveColumn(header)}
                                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1 rounded"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </th>
                                                ))}
                                                <th className="p-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((row, i) => (
                                                <tr key={i} className="border-b border-border hover:bg-muted/20">
                                                    <td className="p-3 text-center text-muted-foreground">{i + 1}</td>
                                                    {allHeaders.map((key, j) => (
                                                        <td key={j} className="p-2 border-r border-border min-w-[150px]">
                                                            <input
                                                                value={row[key] || ''}
                                                                onChange={(e) => handleChange(i, key, e.target.value)}
                                                                className="w-full bg-transparent p-1 rounded hover:bg-background focus:bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="p-2 text-center">
                                                        <button onClick={() => handleRemoveRow(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 hover:bg-muted rounded text-sm font-medium">Cancel</button>
                    <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
