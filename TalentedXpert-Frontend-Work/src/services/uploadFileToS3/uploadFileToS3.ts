import axios from 'axios';
import { toast } from 'react-toastify';
import { requests } from '../requests/requests';

export const uploadFileToS3 = async (files: any, fileObjs: any, onProgress: ((progress: number) => void ) | null, isPublic: boolean): Promise<any> => {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Authorization': `Bearer ` + token
    };

    try {
        const presignedUrlsResponse = await axios.get(
            `${requests.documentPreSigned}${isPublic ? '/public' : '/private'}`,
            {
                params: { count: files?.length },
                headers,        
                onUploadProgress: (progressEvent: any) => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                }
            }
        );

        const presignedUrls = presignedUrlsResponse?.data;

        if (!presignedUrls || presignedUrls?.length !== files?.length) {
            throw new Error('Mismatch between number of files and number of presigned URLs.');
        }

        const uploadedFiles = [];

        // Using a for...of loop to handle async operations one by one
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const fileObj = fileObjs[index];
            const presignedUrl = presignedUrls[index].presignedUrl;
            const fileUrl = presignedUrls[index].fileUrl;

            try {
                const response = await axios.put(presignedUrl, file, {
                    headers: {
                        'Content-Type': fileObj.mimeType, // The file mime type must match
                    },
                    onUploadProgress: (progressEvent: any) => {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        if (onProgress) onProgress(progress); // Update progress if provided
                    },
                });

                // Add file info to uploadedFiles array
                uploadedFiles.push({
                    // ...fileObj,
                    key: fileObj.fileName,
                    fileUrl: fileUrl
                });
                
            } catch (err: any) {
                console.warn(err);
                toast.error(err?.message || 'Something went wrong while uploading the file, please try again');
                throw err; // Stop further uploads if one fails
            }
        }

        return uploadedFiles;
    } catch (err:any) {
        console.warn(err);
        toast.error(err?.message || 'Something went wrong, please try again');
        throw err;
    }

}