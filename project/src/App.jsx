import { useState, useEffect } from 'react';
import ConnectMachine from './components/ConnectMachine';
import UploadPDF from './components/UploadPDF';
import JobStatus from './components/JobStatus';

function App() {
  const [step, setStep] = useState('connect');
  const [connectionData, setConnectionData] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const machineKey = urlParams.get('machineKey');

    if (machineKey) {
      console.log('Machine key from URL:', machineKey);
    }
  }, []);

  const handleConnect = (data) => {
    setConnectionData(data);
    setStep('upload');
  };

  const handleJobCreated = (job) => {
    setCurrentJob(job);
    setStep('status');
  };

  const handlePaymentComplete = () => {
    console.log('Payment completed successfully');
  };

  return (
    <>
      {step === 'connect' && (
        <ConnectMachine onConnect={handleConnect} />
      )}

      {step === 'upload' && connectionData && (
        <UploadPDF
          machine={connectionData.machine}
          user={connectionData.user}
          session={connectionData.session}
          onJobCreated={handleJobCreated}
        />
      )}

      {step === 'status' && currentJob && connectionData && (
        <JobStatus
          job={currentJob}
          machine={connectionData.machine}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}

export default App;
