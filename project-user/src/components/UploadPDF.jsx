import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';

export default function UploadPDF({ machine, user, session, onJobCreated }) {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pagesToPrint, setPagesToPrint] = useState('');
  const [priority, setPriority] = useState(2);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BACKEND_URL;

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let pageCount = 0;
      const textDecoder = new TextDecoder('utf-8');
      const text = textDecoder.decode(uint8Array);
      const matches = text.match(/\/Type[\s]*\/Page[^s]/g);
      if (matches) {
        pageCount = matches.length;
      }

      if (pageCount === 0) {
        const countMatch = text.match(/\/N\s+(\d+)/);
        if (countMatch) {
          pageCount = parseInt(countMatch[1]);
        }
      }

      setTotalPages(pageCount || 1);
      setPagesToPrint(`1-${pageCount || 1}`);
    } catch (err) {
      console.error('Error reading PDF:', err);
      setTotalPages(1);
      setPagesToPrint('1');
    } finally {
      setLoading(false);
    }
  };

  const calculatePagesCount = (pagesString) => {
    let count = 0;
    const parts = pagesString.split(',').map(p => p.trim());

    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          count += Math.abs(end - start) + 1;
        }
      } else {
        const page = Number(part);
        if (!isNaN(page)) {
          count += 1;
        }
      }
    });

    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const uploadResponse = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      let fileUrl;

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        fileUrl = uploadData.url || '';
      } else {
        const arrayBuffer = await file.arrayBuffer();
        fileUrl = `data:application/pdf;base64,${btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        )}`;
      }

      // Validate
      if (!fileUrl) {
        setError('Failed to get file URL. Upload aborted.');
        setUploading(false);
        return;
      }


      const pagesCount = calculatePagesCount(pagesToPrint);

      const response = await fetch(`${API_BASE}/api/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId: machine._id || machine.id,
          userId: user._id || user.id,
          userName: user.name,
          fileUrl,
          fileName: file.name,
          totalPages,
          pagesToPrint,
          pagesCount,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create print job');
      }

      setSuccess(true);
      setTimeout(() => {
        onJobCreated(data);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const estimatedCost = () => {
    if (!pagesToPrint) return 0;
    const pagesCount = calculatePagesCount(pagesToPrint);
    const priorityFactor = priority === 1 ? 1.5 : 1.0;
    return (pagesCount * machine.rate_per_page * priorityFactor).toFixed(2);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Created!</h2>
          <p className="text-gray-600">Your print job has been added to the queue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload PDF to Print</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Machine:</strong> {machine.name} ({machine.location})
              </p>
              <p className="text-sm text-blue-800">
                <strong>Rate:</strong> ₹{machine.rate_per_page}/page
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
              >
                {file ? (
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {loading ? 'Analyzing...' : `${totalPages} pages`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setTotalPages(0);
                        setPagesToPrint('');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Click to upload PDF</p>
                    <p className="text-sm text-gray-400 mt-1">or drag and drop</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {file && totalPages > 0 && (
              <>
                <div>
                  <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-2">
                    Pages to Print
                  </label>
                  <input
                    id="pages"
                    type="text"
                    value={pagesToPrint}
                    onChange={(e) => setPagesToPrint(e.target.value)}
                    placeholder="e.g., 1-3,5,7"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Example: "1-3,5,7" will print pages 1, 2, 3, 5, and 7
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPriority(2)}
                      className={`p-4 rounded-lg border-2 transition ${priority === 2
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="font-semibold">Normal</div>
                      <div className="text-sm">Standard Queue</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority(1)}
                      className={`p-4 rounded-lg border-2 transition ${priority === 1
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="font-semibold">Urgent</div>
                      <div className="text-sm">+50% Cost</div>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Pages to print:</span>
                    <span className="font-semibold">{calculatePagesCount(pagesToPrint)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Rate per page:</span>
                    <span className="font-semibold">₹{machine.rate_per_page}</span>
                  </div>
                  {priority === 1 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Urgent multiplier:</span>
                      <span className="font-semibold">1.5x</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Cost:</span>
                    <span className="text-2xl font-bold text-blue-600">₹{estimatedCost()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Job...</span>
                    </>
                  ) : (
                    <span>Add to Queue & Proceed to Payment</span>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
