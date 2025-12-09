import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cell from './Cell';
import Toolbar from './Toolbar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const initialData = {
    rows: 5,
    cols: 5,
    rowHeights: {}, // index -> height
    colWidths: {}, // index -> width

    cells: {},
};

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 40;

const Table = () => {
    const [data, setData] = useState(initialData);
    const [selection, setSelection] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const tableRef = useRef(null); // Ref for the grid container

    // Resizing State
    const [resizing, setResizing] = useState(null);

    const addRow = () => setData(prev => ({ ...prev, rows: prev.rows + 1 }));
    const addCol = () => setData(prev => ({ ...prev, cols: prev.cols + 1 }));

    const handleMouseDown = (r, c) => {
        setIsSelecting(true);
        setSelection({ start: { r, c }, end: { r, c } });
    };

    const handleMouseEnter = (r, c) => {
        if (isSelecting) {
            setSelection(prev => ({ ...prev, end: { r, c } }));
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setResizing(null);
    };

    const isCellSelected = (r, c) => {
        if (!selection) return false;
        const { start, end } = selection;
        const minR = Math.min(start.r, end.r);
        const maxR = Math.max(start.r, end.r);
        const minC = Math.min(start.c, end.c);
        const maxC = Math.max(start.c, end.c);
        return r >= minR && r <= maxR && c >= minC && c <= maxC;
    };

    // Merge functionality removed as per user request


    // Resize Handlers
    const startResizeCol = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing({
            type: 'col',
            index,
            startPos: e.clientX,
            startSize: data.colWidths[index] || DEFAULT_COL_WIDTH
        });
    };

    const startResizeRow = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing({
            type: 'row',
            index,
            startPos: e.clientY,
            startSize: data.rowHeights[index] || DEFAULT_ROW_HEIGHT
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizing) return;

            if (resizing.type === 'col') {
                const diff = e.clientX - resizing.startPos;
                const newWidth = Math.max(40, resizing.startSize + diff);
                setData(prev => ({
                    ...prev,
                    colWidths: { ...prev.colWidths, [resizing.index]: newWidth }
                }));
            } else {
                const diff = e.clientY - resizing.startPos;
                const newHeight = Math.max(20, resizing.startSize + diff);
                setData(prev => ({
                    ...prev,
                    rowHeights: { ...prev.rowHeights, [resizing.index]: newHeight }
                }));
            }
        };

        const handleMouseUpGlobal = () => {
            setResizing(null);
            setIsSelecting(false);
        };

        if (resizing || isSelecting) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUpGlobal);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, [resizing, isSelecting]);

    // API Actions
    const saveTable = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/tables/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'My Table', data }),
            });
            const result = await response.json();
            console.log('Saved:', result);
            alert('Table saved!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Save failed');
        }
    };

    const exportPdf = async () => {
        if (!tableRef.current) return;

        const html = tableRef.current.outerHTML;

        try {
            const response = await fetch('http://localhost:3000/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, css: '' }), // CSS is injected by backend via CDN
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'table.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        }
    };

    // Grid Template Generation
    const gridTemplateColumns = `50px ${Array.from({ length: data.cols }).map((_, i) =>
        `${data.colWidths[i] || DEFAULT_COL_WIDTH}px`
    ).join(' ')}`;

    const gridTemplateRows = `30px ${Array.from({ length: data.rows }).map((_, i) =>
        `${data.rowHeights[i] || DEFAULT_ROW_HEIGHT}px`
    ).join(' ')}`;

    return (
        <div className="p-4 overflow-auto">
            <Toolbar
                onAddRow={addRow}
                onAddCol={addCol}

                onToggleGrid={() => setShowGrid(!showGrid)}
                onSave={saveTable}
                onExportPdf={exportPdf}
            />

            <div
                ref={tableRef}
                className={twMerge(
                    "grid border border-border select-none relative bg-background",
                    !showGrid && "border-none"
                )}
                style={{
                    gridTemplateColumns,
                    gridTemplateRows,
                }}
            >
                {/* Top-Left Corner */}
                <div className="bg-muted border-r border-b border-border sticky top-0 left-0 z-20 print:hidden"></div>

                {/* Column Headers */}
                {Array.from({ length: data.cols }).map((_, c) => (
                    <div key={`h-${c}`} className="bg-muted border-r border-b border-border relative flex items-center justify-center text-xs font-mono sticky top-0 z-10 print:hidden">
                        {String.fromCharCode(65 + c)}
                        <div
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                            onMouseDown={(e) => startResizeCol(e, c)}
                        ></div>
                    </div>
                ))}

                {/* Rows */}
                {Array.from({ length: data.rows }).map((_, r) => (
                    <React.Fragment key={`r-${r}`}>
                        {/* Row Header */}
                        <div className="bg-muted border-r border-b border-border relative flex items-center justify-center text-xs font-mono sticky left-0 z-10 print:hidden">
                            {r + 1}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50"
                                onMouseDown={(e) => startResizeRow(e, r)}
                            ></div>
                        </div>
                        {/* Cells */}
                        {Array.from({ length: data.cols }).map((_, c) => {
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    className={twMerge(
                                        "relative",
                                        isCellSelected(r, c) && "ring-2 ring-primary z-0 print:ring-0"
                                    )}
                                    onMouseDown={() => handleMouseDown(r, c)}
                                    onMouseEnter={() => handleMouseEnter(r, c)}
                                >
                                    <Cell
                                        row={r}
                                        col={c}
                                        data={data}
                                        setData={setData}
                                        showGrid={showGrid}
                                    />
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Table;
