import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CourseOutcomesPage from './pages/CourseOutcomesPage';
import QuestionPaperPage from './pages/QuestionPaperPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/course-details" replace />} />
          <Route path="course-details" element={<CourseDetailsPage />} />
          <Route path="course-outcomes" element={<CourseOutcomesPage />} />
          <Route path="question-paper" element={<QuestionPaperPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
