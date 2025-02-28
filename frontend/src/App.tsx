// App.tsx
import React, { useEffect, useState } from "react";

const LibraryList: React.FC = () => {
  const [libraries, setLibraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibraries = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/rooms/libraries/");
      if (!response.ok) throw new Error("Error fetching libraries");
  
      const data = await response.json();
      console.log("Fetched Libraries:", data);  // ✅ Log the data
  
      // Access the `results` array, which contains the library objects
      const librariesArray = Array.isArray(data.results) ? data.results : [];
      setLibraries(librariesArray);
    } catch (error) {
      console.error(error);
      //setError(error.message || "Error fetching libraries");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  useEffect(() => {
  fetchLibraries();
  }, []);  // Fetch once when the component mounts

  if (loading) return <div>Loading libraries...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold">Available Libraries</h2>
        <ul>
          {Array.isArray(libraries) && libraries.length > 0 ? (
            libraries.map((library: any) => (
              <li key={library.id} className="p-4 border-b">{library.name}  {/* Displaying the name */}</li>
            ))
          ) : (
            <p>No libraries found.</p>
          )}
        </ul>
    </div>

  );
};

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900">LibMaster</h1>
      <LibraryList />
    </div>
  );
}





// export default function App(): JSX.Element {
//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <h1 className="text-3xl font-bold text-gray-900">
//         LibMaster
//       </h1>
//     </div>
//   );
// }