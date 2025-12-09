import React, { useState } from 'react';
import RichTextToolbar from './RichTextToolbar';
import { twMerge } from 'tailwind-merge';

const Cell = ({ row, col, data, setData, showGrid }) => {
    const [isFocused, setIsFocused] = useState(false);
    const cellId = `${row},${col}`;
    const cellData = data.cells[cellId] || { content: '' };

    const handleChange = (e) => {
        const newValue = e.target.innerHTML;
        setData(prev => ({
            ...prev,
            cells: {
                ...prev.cells,
                [cellId]: { ...prev.cells[cellId], content: newValue }
            }
        }));
    };

    return (
        <div
            className={twMerge(
                "w-full h-full min-h-[40px] relative group bg-background",
                showGrid && "border-r border-b border-border"
            )}
        >
            {isFocused && <RichTextToolbar />}
            <div
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => { setIsFocused(false); handleChange(e); }}
                className="w-full h-full p-2 outline-none focus:bg-accent/20"
                dangerouslySetInnerHTML={{ __html: cellData.content }}
            />
        </div>
    );
};

export default Cell;
