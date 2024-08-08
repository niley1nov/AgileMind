import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import PhasePage from './pages/PhasePage';
import QuestionsPage from './pages/QuestionsPage';
import EpicPage from './pages/EpicPage';
import Layout from './layouts/Layout';
import GuestLayout from './layouts/GuestLayout';
import StoryPage from './pages/StoryPage';
import DependencyGraphPage from './pages/DependencyGraphPage';


import './App.css';

function App() {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route element={<GuestLayout />}>
						<Route path='/login' element={<LoginPage />} />
						<Route path='/register' element={<RegistrationPage />} />
					</Route>
					<Route element={<Layout />}>
						<Route path='/' element={<Home />} />
						<Route path='/Project/:id' element={<ProjectPage />} />
						<Route path='/Phase/:id' element={<PhasePage />} />
						<Route path='/Questions/:type/:id' element={<QuestionsPage />} />
						<Route path='/Epic/:id' element={<EpicPage />} />
						<Route path='/Story/:id' element={<StoryPage />} />
						<Route path='/Dependency/:id' element={<DependencyGraphPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	)
}

export default App
