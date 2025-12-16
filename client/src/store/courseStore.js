import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCourseStore = create(
    persist(
        (set) => ({
            courseDetails: {
                academicYear: '',
                batch: '',
                examSeason: '',
                courseCode: '',
                semester: '',
                credits: '',
                facultyName: '',
                branch: ''
            },
            studentData: [],
            headers: [], // explicit column order
            outcomes: [{ id: 1, statement: '', target: 60 }],

            // Multiple Question Papers Storage
            questionPapers: [
                {
                    id: 1,
                    name: 'End Semester Question Paper',
                    questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }],
                    marks: {}
                }
            ],

            // Multiple Assessments Storage
            courseAssessments: [
                {
                    id: 1,
                    name: 'Assessment 1',
                    questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }],
                    marks: {}
                }
            ],

            setCourseDetails: (details) => set((state) => ({
                courseDetails: { ...state.courseDetails, ...details }
            })),

            setStudentData: (data) => set({ studentData: data }),
            setHeaders: (headers) => set({ headers }),
            setOutcomes: (outcomes) => set({ outcomes }),

            // QP Actions
            addQuestionPaper: (name) => set((state) => ({
                questionPapers: [
                    ...state.questionPapers,
                    {
                        id: state.questionPapers.length > 0 ? Math.max(...state.questionPapers.map(q => q.id)) + 1 : 1,
                        name: name || `Question Paper ${state.questionPapers.length + 1}`,
                        questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }],
                        marks: {}
                    }
                ]
            })),

            removeQuestionPaper: (id) => set((state) => ({
                questionPapers: state.questionPapers.filter(q => q.id !== id)
            })),

            updateQuestionPaperName: (id, name) => set((state) => ({
                questionPapers: state.questionPapers.map(q =>
                    q.id === id ? { ...q, name } : q
                )
            })),

            setQuestionPaperQuestions: (id, questions) => set((state) => ({
                questionPapers: state.questionPapers.map(q =>
                    q.id === id ? { ...q, questions } : q
                )
            })),

            setQuestionPaperMark: (qpId, studentIndex, questionId, mark) => set((state) => ({
                questionPapers: state.questionPapers.map(q => {
                    if (q.id === qpId) {
                        return {
                            ...q,
                            marks: {
                                ...q.marks,
                                [studentIndex]: {
                                    ...(q.marks[studentIndex] || {}),
                                    [questionId]: mark
                                }
                            }
                        };
                    }
                    return q;
                })
            })),

            // Assessment Actions
            addCourseAssessment: (name) => set((state) => ({
                courseAssessments: [
                    ...state.courseAssessments,
                    {
                        id: state.courseAssessments.length > 0 ? Math.max(...state.courseAssessments.map(a => a.id)) + 1 : 1,
                        name: name || `Assessment ${state.courseAssessments.length + 1}`,
                        questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }],
                        marks: {}
                    }
                ]
            })),

            removeCourseAssessment: (id) => set((state) => ({
                courseAssessments: state.courseAssessments.filter(a => a.id !== id)
            })),

            updateAssessmentName: (id, name) => set((state) => ({
                courseAssessments: state.courseAssessments.map(a =>
                    a.id === id ? { ...a, name } : a
                )
            })),

            setAssessmentQuestions: (id, questions) => set((state) => ({
                courseAssessments: state.courseAssessments.map(a =>
                    a.id === id ? { ...a, questions } : a
                )
            })),

            setAssessmentMark: (assessmentId, studentIndex, questionId, mark) => set((state) => ({
                courseAssessments: state.courseAssessments.map(a => {
                    if (a.id === assessmentId) {
                        return {
                            ...a,
                            marks: {
                                ...a.marks,
                                [studentIndex]: {
                                    ...(a.marks[studentIndex] || {}),
                                    [questionId]: mark
                                }
                            }
                        };
                    }
                    return a;
                })
            })),

            coMarks: {},

            setCoMark: (studentIndex, coId, mark) => set((state) => ({
                coMarks: {
                    ...state.coMarks,
                    [studentIndex]: {
                        ...(state.coMarks[studentIndex] || {}),
                        [coId]: mark
                    }
                }
            })),

            reset: () => set({
                courseDetails: {
                    academicYear: '',
                    batch: '',
                    examSeason: '',
                    courseCode: '',
                    semester: '',
                    credits: '',
                    facultyName: '',
                    branch: ''
                },
                studentData: [],
                headers: [],
                outcomes: [{ id: 1, statement: '', target: 60 }],
                questionPapers: [{ id: 1, name: 'End Semester Question Paper', questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }], marks: {} }],
                courseAssessments: [{ id: 1, name: 'Assessment 1', questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }], marks: {} }],
                coMarks: {},
            })
        }),
        {
            name: 'course-storage', // name of the item in the storage (must be unique)
        }
    )
);
