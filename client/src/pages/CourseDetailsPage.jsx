import React from 'react';
import CourseDetails from '../components/CourseBuilder/CourseDetails';

export default function CourseDetailsPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">Course Details</h1>
                <p className="text-muted-foreground">Enter basic course information.</p>
            </div>
            <CourseDetails />
        </div>
    );
}
