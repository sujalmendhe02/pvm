export default function QueueDisplay({ queue }) {
  return (
    <div className="bg-gray-100 rounded-xl p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">Print Queue</h2>
      <ul>
        {queue.length === 0 ? (
          <p className="text-gray-500">No jobs in queue</p>
        ) : (
          queue.map((job, i) => (
            <li
              key={i}
              className="border-b border-gray-300 py-2 flex justify-between"
            >
              <span>{job.userName}</span>
              <span>{job.priority === 1 ? "Urgent" : "Normal"}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
