// App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider } from './contexts/LibraryContext';
import LibraryBrowser from './components/LibraryBrowser';

const App: React.FC = () => {
    return (
        <LibraryProvider>
            <div className="min-h-screen bg-gray-100 p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    LibMaster
                </h1>
                <main className="pt-4">
                    <Routes>
                        <Route path="/" element={<LibraryBrowser />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </LibraryProvider>
  );
}

export default App;
