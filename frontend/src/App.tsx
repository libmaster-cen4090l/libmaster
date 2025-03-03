/**
 * App Component 
 *
 * Root componentfor the LibMaster application.
 * Serves as a container for the main content and nested routes.
 *
 * Author(s): Ivan Lepesii, Zack Lima, Colby Leavitt, Dylan Connolly
 * Modified: 3/3/2025 @ 3:39:41 EST by Dylan 
 *
 * MODIFICATIONS:
 * - Simplified component structure to focus on LibraryBrowser 
 * - Maintained LibraryProvider wrapper for backward compatibility
 * - Note: The LibraryProvider here is now redundant since main.tsx also wraps 
 *   everything in LibraryProvider, but is kept for component-level functionality
 *
 * @component 
 * @requires React 
 * @requires react-router-dom
 * @requires ./contexts/LibraryContext 
 * @requires ./components/LibraryBrowser 
 */ 

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
