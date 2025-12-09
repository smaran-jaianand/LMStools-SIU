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
            outcomes: [{ id: 1, statement: '', target: 60 }],
            questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }],

            setCourseDetails: (details) => set((state) => ({
                courseDetails: { ...state.courseDetails, ...details }
            })),

            setStudentData: (data) => set({ studentData: data }),
            setOutcomes: (outcomes) => set({ outcomes }),
            setQuestions: (questions) => set({ questions }),

            coMarks: {},
            questionMarks: {},

            setCoMark: (studentIndex, coId, mark) => set((state) => ({
                coMarks: {
                    ...state.coMarks,
                    [studentIndex]: {
                        ...(state.coMarks[studentIndex] || {}),
                        [coId]: mark
                    }
                }
            })),

            setQuestionMark: (studentIndex, questionId, mark) => set((state) => ({
                questionMarks: {
                    ...state.questionMarks,
                    [studentIndex]: {
                        ...(state.questionMarks[studentIndex] || {}),
                        [questionId]: mark
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
                outcomes: [{ id: 1, statement: '', target: 60 }],
                questions: [{ id: 1, text: '', marks: '', co: '', bl: '' }],
                coMarks: {},
                questionMarks: {}
            })
        }),
        {
            name: 'course-storage', // name of the item in the storage (must be unique)
        }
    )
);
