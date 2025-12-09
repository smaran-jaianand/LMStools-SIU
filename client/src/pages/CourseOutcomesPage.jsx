import React from 'react';
import CourseOutcomes from '../components/CourseBuilder/CourseOutcomes';

export default function CourseOutcomesPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">Course Outcomes</h1>
                <p className="text-muted-foreground">Define course outcomes and targets.</p>
            </div>
            <CourseOutcomes />
        </div>
    );
}
