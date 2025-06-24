export interface FileUploadProps {
    onFileSelect: (files: File[], fileObjs: any[], onProgress: (progress: number) => void) => Promise<number[]>;
    accept?: string;
    label?: string;
    showPreview?: boolean;
    type?: 'msg' | 'task' | 'img';
    documents?: any
}