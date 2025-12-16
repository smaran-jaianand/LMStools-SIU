import React from 'react';
import CourseAssessment from '../components/CourseBuilder/CourseAssessment';

export default function CourseAssessmentPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">Course Assessment</h1>
                <p className="text-muted-foreground">Manage course assessments and student marks.</p>
            </div>
            <CourseAssessment />
        </div>
    );
}
