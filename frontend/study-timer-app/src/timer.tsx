import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

type Session = {
  subject: string;
  start_time: string;
  end_time: string;
};

export const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subject, setSubject] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setShowDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const startSession = async () => {
    if (!subject.trim()) return alert("Enter a subject");
    try {
      const res = await fetch("http://localhost:5000/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();
      toast.info(data.message);
      toast.success("✅ Success in your studies!");

      setIsRunning(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Start failed:", error);
      toast.error("Failed to start session.");
    }
  };

  const pauseSession = async () => {
    try {
      const res = await fetch("http://localhost:5000/pause-session", {
        method: "POST",
      });
      const data = await res.json();
      toast.info(data.message);

      setIsPaused(true);
    } catch (error) {
      console.error("Pause failed:", error);
      toast.error("Failed to pause session.");
    }
  };

  const resumeSession = async () => {
    try {
      const res = await fetch("http://localhost:5000/resume-session", {
        method: "POST",
      });
      const data = await res.json();

      setIsPaused(false);
      toast.info(data.message);
    } catch (error) {
      console.error("Resume failed:", error);
      toast.error("Failed to resume session.");
    }
  };

  const completeSession = async () => {
    try {
      const res = await fetch("http://localhost:5000/complete-session", {
        method: "POST",
      });
      const data = await res.json();
      setSubject("");
      setTimeLeft(5 * 60);
      fetchSessions();
      setShowDialog(false);
      toast.info(data.message);
    } catch (error) {
      console.error("Completion failed:", error);
      toast.error("Failed to end session.");
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("http://localhost:5000/sessions");
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col justify-between items-center min-h-screen px-4 py-8 bg-background text-black">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-700">
          📚 Study Timer
        </h1>
        <p className="text-3xl sm:text-4xl font-mono text-gray-900">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </p>

        {/* ⭐ Show current session in progress */}
        {isRunning && (
          <p className="text-lg text-gray-700 italic">
            ⏳ Currently Studying:{" "}
            <span className="font-semibold">{subject}</span>
          </p>
        )}
      </div>

      <div className="w-full max-w-md space-y-4">
        {!isRunning && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
            <Input
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full"
            />
            <Button onClick={startSession} className="w-full sm:w-auto">
              Start
            </Button>
          </div>
        )}

        {isRunning && !isPaused && (
          <Button
            variant="outline"
            onClick={pauseSession}
            className="bg-yellow-500 text-white hover:bg-yellow-600 w-full"
          >
            Pause
          </Button>
        )}

        {isRunning && isPaused && (
          <Button
            variant="outline"
            onClick={resumeSession}
            className="bg-green-500 text-white hover:bg-green-600 w-full"
          >
            Resume
          </Button>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <p className="text-lg">
            ⏰ Time's up! Ready to complete the session?
          </p>
          <Button className="mt-4 w-full" onClick={completeSession}>
            ✅ Yes, Complete
          </Button>
        </DialogContent>
      </Dialog>

      <div className="mt-8 w-full max-w-md bg-white shadow-md rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">
          📖 Completed Sessions
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {sessions.map((s, i) => (
            <li key={i}>
              <strong>{s.subject}</strong> – {s.start_time} ➡ {s.end_time}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
