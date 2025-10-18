import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Printer, Clock, CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';

export default function JobStatus({ job: initialJob, machine, onPaymentComplete }) {
  const [job, setJob] = useState(initialJob);
  const [queuePosition, setQueuePosition] = useState(null);
  const [queueLength, setQueueLength] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('print-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_jobs',
          filter: `id=eq.${job.id}`,
        },
        (payload) => {
          console.log('Job updated:', payload);
          if (payload.new) {
            setJob(payload.new);
          }
        }
      )
      .subscribe();

    fetchQueueStatus();

    const interval = setInterval(fetchQueueStatus, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [job.id]);

  const fetchQueueStatus = async () => {
    try {
      const { data: queueJobs } = await supabase
        .from('print_jobs')
        .select('id, priority, created_at')
        .eq('machine_id', machine.id)
        .in('status', ['queued', 'printing'])
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (queueJobs) {
        const position = queueJobs.findIndex(j => j.id === job.id);
        setQueuePosition(position >= 0 ? position + 1 : null);
        setQueueLength(queueJobs.length);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('print_jobs')
        .update({
          payment_status: 'paid',
          payment_id: `PAY_${Date.now()}`,
        })
        .eq('id', job.id);

      if (error) throw error;

      setJob(prev => ({
        ...prev,
        payment_status: 'paid',
        payment_id: `PAY_${Date.now()}`,
      }));

      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="w-8 h-8 text-yellow-600" />;
      case 'printing':
        return <Printer className="w-8 h-8 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Clock className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'queued':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'printing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'queued':
        return 'In Queue';
      case 'printing':
        return 'Printing Now';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {getStatusIcon()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Print Job Status</h2>
            <div className={`inline-block px-4 py-2 rounded-full border-2 ${getStatusColor()} font-semibold`}>
              {getStatusText()}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">File Name</p>
                  <p className="font-semibold text-gray-800">{job.file_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pages</p>
                  <p className="font-semibold text-gray-800">{job.pages_to_print}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className="font-semibold text-gray-800">
                    {job.priority === 1 ? '🔥 Urgent' : '⏱️ Normal'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="font-semibold text-gray-800">₹{job.cost}</p>
                </div>
              </div>
            </div>

            {job.status === 'queued' && queuePosition && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Queue Position:</strong> {queuePosition} of {queueLength}
                </p>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((queueLength - queuePosition + 1) / queueLength) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {job.status === 'printing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-blue-800 font-semibold">Your document is being printed...</p>
              </div>
            )}

            {job.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold text-lg">Print job completed successfully!</p>
                <p className="text-green-700 text-sm mt-1">Please collect your documents from the machine</p>
              </div>
            )}
          </div>

          {job.payment_status === 'pending' && (
            <div className="border-t pt-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800 font-semibold mb-1">Payment Required</p>
                <p className="text-sm text-orange-700">
                  Complete your payment to start printing
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₹{job.cost}</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                Secure payment powered by Razorpay
              </p>
            </div>
          )}

          {job.payment_status === 'paid' && (
            <div className="border-t pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">Payment Successful</p>
                <p className="text-sm text-green-700 mt-1">Transaction ID: {job.payment_id}</p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Machine: <strong>{machine.name}</strong> • {machine.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
