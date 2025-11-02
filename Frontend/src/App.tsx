import { Button } from "./components/ui/button";

function App() {
  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">
        Hello Tailwind + React + TypeScript 💙
      </h1>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Click Me
      </button>
      

    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button className="text-blue-400 border border-blue-400 px-4 py-2 rounded-lg">Click me</Button>

    </div>

  );
}
export default App;
