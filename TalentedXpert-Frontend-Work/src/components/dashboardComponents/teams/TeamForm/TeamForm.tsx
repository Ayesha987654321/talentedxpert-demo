"use client";
import { dataForServer } from "@/models/teamModel/teamModel";
import { teamSchema } from "@/schemas/teams/teamSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { uploadFileToS3 } from "@/services/uploadFileToS3/uploadFileToS3";
import FileUpload from "@/components/common/upload/FileUpload";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigation } from "@/hooks/useNavigation";
const QuillEditor = dynamic(
  () => import("@/components/common/TextEditor/TextEditor"),
  { ssr: false }
);

type FormSchemaType = z.infer<typeof teamSchema>;

const TeamForm: FC<any> = ({ type }) => {
  const { id } = useParams();

  const [editorTxt, setEditorTxt] = useState("");
  const [documents, setDocuments] = useState<any>({});

  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { navigate } = useNavigation();
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormSchemaType>({
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
    },
    resolver: zodResolver(teamSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    setIsFormSubmitted(true);
    const formData = dataForServer(data);
    await apiCall(
      `${type ? requests.teams + `/${id}` : requests.teams}`,
      formData,
      `${type ? "put" : "post"}`,
      true,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        let message: any;
        if (res?.error) {
          message = res?.error?.message;

          if (Array.isArray(message)) {
            message?.map((msg: string) =>
              toast.error(msg ? msg : "Something went wrong, please try again")
            );
          } else {
            toast.error(
              message ? message : "Something went wrong, please try again"
            );
          }
          setIsFormSubmitted(false);
        } else {
          toast.success(res?.data?.message);
          navigate(`/dashboard/teams`);
          setIsFormSubmitted(false);
        }
      })
      .catch((err) => {
        console.warn(err);
        setIsFormSubmitted(false);
      });
  };

  const handleFileSelect = async (
    files: File[],
    fileObjs: any[],
    onProgress: (progress: number) => void
  ): Promise<number[]> => {
    const uploadedFileIds = files
      ? await uploadFileToS3(files, fileObjs, onProgress, true)
      : 0;
    setDocuments(uploadedFileIds[0]);
    setValue("logoUrl", uploadedFileIds[0]?.fileUrl);
    return uploadedFileIds;
  };

  const handleEditorTxt = (value: any) => {
    setEditorTxt(value.replace(/<[^>]*>/g, "").trim() !== "" ? value : "");
    setValue(
      "description",
      value.replace(/<[^>]*>/g, "").trim() !== "" ? value : ""
    );
    clearErrors("description");
  };

  return (
    <section className="addtask">
      <div className="card">
        <div className="card-header bg-dark text-light">
          <h5>{type ? "Update" : "Add New"} Team</h5>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body bg-gray">
            <div className="text-center mb-4 mt-1 ">
              <FileUpload
                onFileSelect={handleFileSelect}
                label="Upload File"
                accept="image/*"
                type="img"
                documents={documents}
              />
              {errors.logoUrl && (
                <div className="text-danger pt-2">{errors.logoUrl.message}</div>
              )}
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label text-light fs-12">
                    Team Name <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="form-control bg-dark border-0"
                    name="name"
                    placeholder="Your Team Name"
                  />
                  {errors.name && (
                    <div className="text-danger pt-2">
                      {errors.name.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label
                    htmlFor="description"
                    className="form-label text-light fs-14"
                  >
                    Description
                  </label>
                  <QuillEditor
                    className=" bg-white text-white invert border-0"
                    style={{ height: "150px" }}
                    placeholder="Description"
                    value={editorTxt}
                    setValue={handleEditorTxt}
                  />
                  {errors.description && (
                    <div className="text-danger pt-2">
                      {errors.description.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 text-end">
                <button
                  type="button"
                  disabled={isFormSubmitted}
                  className="btn rounded-pill btn-outline-info btn-sm me-2 ls"
                  onClick={() => navigate("/dashboard/teams")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitted}
                  className="btn btn-info btn-sm rounded-pill"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default TeamForm;
