import { Timer } from "./timer";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="flex justify-center bg-background">
      <Toaster richColors />
      <Timer />
    </div>
  );
}

export default App;
