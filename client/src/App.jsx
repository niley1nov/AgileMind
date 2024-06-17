import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import Layout from './Layout';
import './App.css';

function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout/>}>
              <Route path='/' element={<Home/>}/>
              <Route path='/Project' element={<ProjectPage/>}/>
            </Route>
          </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
