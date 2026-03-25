import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { PrototypeNav } from './components/PrototypeNav';
import { DashboardScreen } from './components/Dashboard';
import { EditorScreen } from './components/Editor';
import { ProjectManagerScreen } from './components/Projects';
import { SettingsScreen } from './components/Settings';
import { CanvasScreen } from './components/Canvas';

const App: React.FC = () => {
  return (
    <AppProvider>
        <HashRouter>
            <PrototypeNav />
            <Routes>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/editor" element={<EditorScreen />} />
                <Route path="/projects" element={<ProjectManagerScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/canvas" element={<CanvasScreen />} />
            </Routes>
        </HashRouter>
    </AppProvider>
  );
};

export default App;