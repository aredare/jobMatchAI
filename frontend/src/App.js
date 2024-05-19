import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import MatchResults from './MatchResults';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

function App() {

  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [results, setResults] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [jobDescUrl, setJobDescUrl] = useState(null);

  const handleFileUpload = (fileType, file) => {
    if (fileType === 'resume') {
      setResume(file);
      setResumeUrl(URL.createObjectURL(file));
    } else {
      setJobDesc(file);
      setJobDescUrl(URL.createObjectURL(file));
    }
  }

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDesc', jobDesc);

    for (let key of formData.keys()) {
      console.log(key); // Check if 'resume' is logged here
    }

    const response = await fetch('http://127.0.0.1:5000/process-files', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Assume the server returns a task ID
    setTaskId(data.taskId);
  }

  useEffect(() => {
    let interval;

    if (taskId) {
      interval = setInterval(async () => {
        const response = await fetch(`http://127.0.0.1:5000/check-task/${taskId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setResults(data.results);
          clearInterval(interval);
        }

      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId]);

    return (
      <div className="container">
        <div className="file-upload-container">
          {resumeUrl && (
              <div className="pdf-viewer">
                <Worker workerUrl={`@react-pdf-viewer/core/lib/worker/index.js`}>
                  <Viewer fileUrl={resumeUrl} />
                </Worker>
              </div>
          )}
          <FileUpload onFileSelect={handleFileUpload} fileTypes={['resume']} />
          <FileUpload onFileSelect={handleFileUpload} fileTypes={['jobDesc']} />
          {jobDescUrl && (
              <div className="pdf-viewer">
                <Worker workerUrl={`@react-pdf-viewer/core/lib/worker/index.js`}>
                  <Viewer fileUrl={jobDescUrl} />
                </Worker>
              </div>
          )}
        </div>
        <button className="compare-button" onClick={handleSubmit}>
          Compare Files
        </button>
        <MatchResults results={results} />
      </div>
  );
}

export default App;


// import {useState} from 'react';
// import FileUpload from './FileUpload';
// import MatchResults from './MatchResults';
//
// function App() {
//
//   const [resume, setResume] = useState(null);
//   const [jobDesc, setJobDesc] = useState(null);
//   const [results, setResults] = useState(null);
//
//   const handleFileUpload = (fileType, file) => {
//     if (fileType === 'resume') {
//       setResume(file);
//     } else {
//       setJobDesc(file);
//     }
//   }
//
//   const handleSubmit = async () => {
//     const formData = new FormData();
//
//     formData.append('resume', resume);
//     formData.append('jobDesc', jobDesc);
//
//     for (let key of formData.keys()) {
//       console.log(key); // Check if 'resume' is logged here
//     }
//
//
//     const response = await fetch('http://127.0.0.1:5000/process-files', {
//       method: 'POST',
//       body: formData
//     });
//
//     const data = await response.json();
//     setResults(data.results);
//   }
//
//
//   return (
//       <div className="container">
//         <div className="file-upload-container">
//           <FileUpload onFileSelect={handleFileUpload} fileTypes={['resume']} />
//           <FileUpload onFileSelect={handleFileUpload} fileTypes={['jobDesc']} />
//         </div>
//         <button className="compare-button" onClick={handleSubmit}>
//           Compare Files
//         </button>
//         <MatchResults results={results} />
//       </div>
//   );
// }
//
// export default App;
