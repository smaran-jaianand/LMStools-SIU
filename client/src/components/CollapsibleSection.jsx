import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CollapsibleSection({ title, children, rightElement, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={20} className="text-muted-foreground" /> : <ChevronRight size={20} className="text-muted-foreground" />}
                    <h2 className="text-xl font-semibold">{title}</h2>
                </div>
                {/* Prevent click propagation if clicking on right elements (buttons) */}
                <div onClick={(e) => e.stopPropagation()}>
                    {rightElement}
                </div>
            </div>

            {isOpen && (
                <div className="p-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
