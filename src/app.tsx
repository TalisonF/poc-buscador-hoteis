import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/home';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Home />} index />
      </Routes>
    </BrowserRouter>
  );
}
