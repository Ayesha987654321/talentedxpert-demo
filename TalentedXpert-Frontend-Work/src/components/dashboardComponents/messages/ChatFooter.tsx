import FileUpload from "@/components/common/upload/FileUpload";
import { uploadFileToS3 } from "@/services/uploadFileToS3/uploadFileToS3";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const ChatFooter = ({
  documents,
  setDocuments,
  toSend,
  setToSend,
  handleKeyDown,
  handleSend,
}: any) => {
  const handleFileSelect = async (
    files: File[],
    fileObjs: any[],
    onProgress: (progress: number) => void
  ): Promise<number[]> => {
    const uploadedFileIds = files
      ? await uploadFileToS3(files, fileObjs, onProgress, false)
      : 0;
    const temp: any = [...documents, ...uploadedFileIds];
    setDocuments(temp);

    return uploadedFileIds;
  };

  return (
    <div className="d-flex mt-auto mb-3">
      <div className="typing-area d-flex align-items-center w-100">
        <div className="chat-area-actions d-flex flex-column w-100 bg-white rounded-3 p-2">
          {/* File attachments displayed above the input */}
          {documents?.length > 0 && (
            <div className="document-chips d-flex gap-2 mb-2 flex-wrap w-100 px-2">
              {documents.map((doc: any, index: number) => (
                <div
                  key={index}
                  className="d-flex align-items-center bg-dark text-white rounded-pill px-3 py-1"
                >
                  <span className="me-2 fs-12">{doc?.key}</span>
                  <Icon
                    icon="gridicons:cross-small"
                    className="cursor-pointer"
                    style={{ color: "white", cursor: "pointer" }}
                    onClick={() => {
                      const updatedDocs = documents.filter(
                        (_: any, i: any) => i !== index
                      );
                      setDocuments(updatedDocs);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Input row with consistent alignment */}
          <div className="d-flex align-items-center w-100">
            {/* Clear text button */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ width: "40px" }}
            >
              {/* {toSend !== "" && (
                <Icon
                  className="cross-icon cursor-pointer"
                  icon="gridicons:cross-small"
                  onClick={() => setToSend("")}
                  width={24}
                  height={24}
                  style={{
                    color: "grey",
                    cursor: "pointer",
                  }}
                />
              )} */}
            </div>

            {/* File upload button */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ width: "40px" }}
            >
              <FileUpload
                onFileSelect={handleFileSelect}
                label="Upload File"
                accept="/*"
                type="msg"
              />
            </div>

            {/* Text input area */}
            <div
              // style={{ paddingRight: "10px" }}
              className="flex-grow-1  d-flex align-items-center"
            >
              <textarea
                className="chat-area-input w-100  py-3"
                style={{ resize: "none", border: "none", outline: "none" }}
                rows={1}
                placeholder="Write a message"
                value={toSend}
                onKeyDown={handleKeyDown}
                onChange={(e) => setToSend(e.target.value)}
              />
            </div>

            {/* Send button */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ width: "40px" }}
            >
              <Icon
                style={{ cursor: "pointer" }}
                className="send-icon cursor-pointer"
                icon="bi:send"
                width={24}
                height={24}
                onClick={handleSend}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice icon */}
      <div className="voice-icon d-flex align-items-center justify-content-center m-2">
        <Icon icon="icon-park-outline:voice" width={24} height={24} />
      </div>
    </div>
  );
};

export default ChatFooter;
