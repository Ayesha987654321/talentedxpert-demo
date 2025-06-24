import React, { useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

const TextEditor: React.FC<any> = ({ value, setValue, className, style, placeholder }) => {
    const quillRef = useRef<ReactQuill | null>(null);

    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const quillContainer = quill.root;

            const observer = new MutationObserver((mutations) => {
                // console.log('DOM Mutations detected:', mutations);
            });

            const config = { childList: true, subtree: true };
            observer.observe(quillContainer, config);

            return () => {
                observer.disconnect();
            };
        }
    }, []);

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
    ];

    const modules = {
        toolbar: toolbarOptions,
    };

    return (
        <div className={`${className}`} style={{ ...style }}>
            <style>
                {`
                    .ql-toolbar.ql-snow {
                        display: flex;
                        flex-wrap: nowrap !important;
                        overflow-x: auto;
                        white-space: nowrap;
                    }
                    .ql-toolbar.ql-snow .ql-formats {
                        display: inline-flex;
                        margin-right: 10px;
                    }
                    .ql-toolbar.ql-snow::-webkit-scrollbar {
                        height: 8px;
                    }
                    .ql-toolbar.ql-snow::-webkit-scrollbar-thumb {
                        background: #888;
                        border-radius: 4px;
                    }
                    .ql-toolbar.ql-snow::-webkit-scrollbar-thumb:hover {
                        background: #555;
                    }
                `}
            </style>
            <ReactQuill
                ref={quillRef}
                value={value}
                onChange={(value) => setValue(value)}
                theme="snow"
                modules={modules} // Uncomment this to enable the toolbar options
                placeholder={placeholder}
                style={{ height: '100%', color: '#fff' }}
            />
        </div>
    );
};

export default TextEditor;