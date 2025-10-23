export default function CurrentJob({ job }) {
  if (!job) return <p>No active print job</p>;

  return (
    <div className="bg-green-50 border border-green-400 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-2">Now Printing</h3>
      <p>{job.userName} - {job.fileName}</p>
      <p className="text-sm text-gray-600">Pages: {job.pages.join(", ")}</p>
    </div>
  );
}
