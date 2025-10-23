import { useEffect, useState } from "react";
import { socket } from "../socket";
import { registerMachine, getQueue } from "../api";
import QRDisplay from "../components/QRDisplay";
import QueueDisplay from "../components/QueueDisplay";
import CurrentJob from "../components/CurrentJob";

export default function MachineDashboard() {
  const [machineId] = useState("ABCD1234"); // can be env variable
  const [queue, setQueue] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);

  useEffect(() => {
    async function init() {
      await registerMachine(machineId);
      socket.emit("joinMachine", machineId);
      const res = await getQueue(machineId);
      setQueue(res.data);
    }

    init();

    socket.on("jobQueued", (job) => setQueue((prev) => [...prev, job]));
    socket.on("printingStarted", (job) => setCurrentJob(job));
    socket.on("printingCompleted", (jobId) =>
      setQueue((prev) => prev.filter((j) => j._id !== jobId))
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Machine Dashboard</h1>
      <QRDisplay machineId={machineId} />
      <CurrentJob job={currentJob} />
      <QueueDisplay queue={queue} />
    </div>
  );
}
