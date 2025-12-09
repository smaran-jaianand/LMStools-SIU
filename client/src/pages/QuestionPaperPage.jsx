import React from 'react';
import QuestionPaper from '../components/CourseBuilder/QuestionPaper';

export default function QuestionPaperPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">Question Paper</h1>
                <p className="text-muted-foreground">Create question paper and map to COs.</p>
            </div>
            <QuestionPaper />
        </div>
    );
}
