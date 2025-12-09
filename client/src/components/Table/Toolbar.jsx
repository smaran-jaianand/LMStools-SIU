import React from 'react';
import { Plus, Trash2, Merge, Split, Grid3X3, Save, FileDown } from 'lucide-react';

const Toolbar = ({ onAddRow, onAddCol, onMerge, onUnmerge, onToggleGrid, onSave, onExportPdf }) => {
    return (
        <div className="flex gap-2 mb-4 p-2 bg-card border border-border rounded-md shadow-sm items-center flex-wrap">
            <button onClick={onAddRow} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
                <Plus size={16} /> Row
            </button>
            <button onClick={onAddCol} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
                <Plus size={16} /> Col
            </button>
            <div className="w-px h-6 bg-border mx-2"></div>
            <button onClick={onMerge} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
                <Merge size={16} /> Merge
            </button>
            <button onClick={onUnmerge} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
                <Split size={16} /> Unmerge
            </button>
            <div className="w-px h-6 bg-border mx-2"></div>
            <button onClick={onToggleGrid} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
                <Grid3X3 size={16} /> Grid
            </button>
            <div className="flex-1"></div>
            <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                <Save size={16} /> Save
            </button>
            <button onClick={onExportPdf} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors">
                <FileDown size={16} /> PDF
            </button>
        </div>
    );
};

export default Toolbar;
