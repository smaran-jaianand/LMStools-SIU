import React from 'react';
import { Bold, Italic, Underline, List, Image as ImageIcon } from 'lucide-react';

const RichTextToolbar = () => {
    const format = (command) => {
        document.execCommand(command, false, null);
    };

    return (
        <div className="flex gap-1 p-1 bg-popover border border-border rounded shadow-sm absolute -top-10 left-0 z-50">
            <button onMouseDown={(e) => { e.preventDefault(); format('bold'); }} className="p-1 hover:bg-accent rounded">
                <Bold size={14} />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); format('italic'); }} className="p-1 hover:bg-accent rounded">
                <Italic size={14} />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); format('underline'); }} className="p-1 hover:bg-accent rounded">
                <Underline size={14} />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); format('insertUnorderedList'); }} className="p-1 hover:bg-accent rounded">
                <List size={14} />
            </button>
        </div>
    );
};

export default RichTextToolbar;
