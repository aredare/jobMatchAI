import { useDropzone } from 'react-dropzone';
import './FileUpload.css'; // Importing the CSS

// const FileUpload = ({ onFileSelect, fileTypes }) => {
//     const handleFileDrop = (acceptedFiles, fileType) => {
//         const file = acceptedFiles[0];
//         onFileSelect(fileType, file);
//     }
//
//     const { getRootProps, getInputProps } = useDropzone({
//         onDrop: acceptedFiles => handleFileDrop(acceptedFiles, "pdf"), // Replace "yourFileType" with the actual file type
//         accept: 'application/pdf' // Only allow PDFs
//     });
//
//     return (
//         <div className="file-upload-container">
//             {fileTypes.map(type => (
//                 <div className="dropzone" {...getRootProps()}>
//                     <input {...getInputProps()} />
//                     <button className="upload-button">Upload {type}</button>
//                     <p>Drag 'n' drop your {type} here, or click the button to select a file</p>
//                 </div>
//             ))}
//         </div>
//     );
// }

const Dropzone = ({ onFileSelect, fileType }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: acceptedFiles => onFileSelect(fileType, acceptedFiles[0]),
        accept: 'application/pdf' // Only allow PDFs
    });

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} />
            <button className="upload-button">Upload {fileType}</button>
            <p>Drag 'n' drop your {fileType} here, or click the button to select a file</p>
        </div>
    );
};

const FileUpload = ({ onFileSelect, fileTypes }) => {
    return (
        <div className="file-upload-container">
            {fileTypes.map(type => (
                <Dropzone key={type} fileType={type} onFileSelect={onFileSelect} />
            ))}
        </div>
    );
};

export default FileUpload;
