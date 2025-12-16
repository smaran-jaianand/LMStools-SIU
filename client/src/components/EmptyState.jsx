import React from 'react';
import { Database, Upload } from 'lucide-react';

export default function EmptyState({ title = "No Data Available", message, icon: Icon = Database, action }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/5 border-2 border-dashed border-border rounded-lg text-center animate-in fade-in zoom-in-95 duration-300 min-h-[300px]">
            <div className="p-4 bg-muted mb-4 rounded-full">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
                {message || "No data to display at this time."}
            </p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
