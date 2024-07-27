import {BrowserRouter, Route, Routes} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import QuestionsPage from './pages/QuestionsPage';
import Layout from './layouts/Layout';
import GuestLayout from './layouts/GuestLayout';

import './App.css';

function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
          <Route element={<GuestLayout/>}>
              <Route path='/login' element={<LoginPage/>} />
              <Route path='/register' element={<RegistrationPage/>}/>
            </Route>
            <Route element={<Layout/>}>
              <Route path='/' element={<Home/>}/>
              <Route path='/Project/:id' element={<ProjectPage/>}/>
              <Route path='/Questions/:type/:id' element={<QuestionsPage/>}/>
            </Route>
          </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
