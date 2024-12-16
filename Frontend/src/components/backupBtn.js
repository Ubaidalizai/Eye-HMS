import React from 'react';
import { MdOutlineCloudDownload } from 'react-icons/md';

const BackupButton = () => {
  const handleBackup = async () => {
    try {
      // Fetch the backup file from the API
      const response = await fetch(
        'http://localhost:4000/api/v1/backup/download',
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch the backup file.');
      }

      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mongodb_backup.gz'); // Filename
      document.body.appendChild(link);
      link.click();

      // Clean up the link after downloading
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Backup downloaded successfully!');
    } catch (error) {
      console.error('Error during backup:', error);
      alert('Failed to download backup. Please try again.');
    }
  };

  return (
    <button
      onClick={handleBackup}
      className='px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition transform duration-150'
    >
      <MdOutlineCloudDownload className='inline-block mr-2' />
    </button>
  );
};

export default BackupButton;
