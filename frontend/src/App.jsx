import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import UploadSection from "./components/UploadSection";





function App(){
  return (
    <div className="app">
      <Navbar />
      <main>
        <UploadSection />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;