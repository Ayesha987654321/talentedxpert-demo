'use client';
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import FileUpload from "../common/upload/FileUpload";
import { uploadFileToS3 } from "@/services/uploadFileToS3/uploadFileToS3";
import { formatedDate, getFileType } from "@/services/utils/util";
import { toast } from "react-toastify";
import { requests } from "@/services/requests/requests";
import apiCall from "@/services/apiCall/apiCall";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import GlobalLoader from "../common/GlobalLoader/GlobalLoader";

const Individual_account: React.FC<any> = ({
  register,
  errors,
  setValue,
  watch,
  setDocuments,
  documents,
  setExpPresent,
  resume,
  setResume,
}) => {
  const isOrganization = watch("userType") === "ORGANIZATION" ? true : false;
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  const handleFileSelect = async (
    files: File[],
    fileObjs: any[],
    onProgress: (progress: number) => void
  ): Promise<number[]> => {
    const uploadedFileId = files
      ? await uploadFileToS3(files, fileObjs, onProgress, true)
      : 0;
    if (getFileType(uploadedFileId[0]?.key) !== "image") {
      toast.error("Please select an image file (PNG, JPEG, GIF, or WEBP)");
      return [];
    } else {
      setDocuments(uploadedFileId[0]);
      setValue("profilePicture", uploadedFileId[0]);
      return uploadedFileId;
    }
  };

  const handleFileResume = async (
    files: File[],
    fileObjs: any[],
    onProgress: (progress: number) => void
  ): Promise<number[]> => {
    const uploadedFileIds = files
      ? await uploadFileToS3(files, fileObjs, onProgress, true)
      : 0;
    if (uploadedFileIds.length > 0) {
      setResume(uploadedFileIds[0]);
      resumeAI(uploadedFileIds[0]?.fileUrl);
    }
    return uploadedFileIds;
  };

  const getAllSkills = async (name: any) => {
    const response = await apiCall(
      requests.getSkills,
      {},
      "get",
      false,
      dispatch,
      null,
      null
    );
    if (name?.length > 0) {
      const filteredSkills = response?.data?.data?.skills?.filter(
        (skill: any) => name.includes(skill.name)
      );
      setValue(
        "skills",
        filteredSkills?.map((skill: any) => ({
          label: skill.name,
          value: skill.id,
        })) || []
      );
    }
  };

  const addSkills = async (name: string[]) => {
    const param = {
      names: name,
    };
    const response = await apiCall(
      requests.getSkills,
      param,
      "post",
      false,
      dispatch,
      null,
      null
    );
    if (response?.data?.data) {
      await getAllSkills(name);
    }
  };

  const resumeAI = async (fileUrl: any) => {
    try {
      setIsLoading(true);
      const response = await apiCall(
        requests.cvParser,
        { fileUrl },
        "post",
        true,
        dispatch,
        user,
        router
      );

      if (response?.data?.result?.parsed_data) {
        const parsedData = response.data.result.parsed_data;

        setValue("firstName", parsedData.firstName || "");
        setValue("lastName", parsedData.lastName || "");
        setValue("mobile", parsedData.mobile || "");
        setValue("about", parsedData.about || "");
        setValue("email", parsedData.email || "");
        setValue("title", parsedData.title || "");
        setValue("websiteLink", parsedData.websiteLink || "");
        setValue("zip", parsedData.zip || "");
        setValue("address", {
          address: parsedData.address || "",
          street: parsedData.street || "",
        });

        if (parsedData.skills?.length > 0) {
          await addSkills(parsedData.skills);
        }

        if (parsedData.education?.length > 0) {
          const formattedEdu = parsedData.education.map((edu: any) => ({
            institution: edu.institution || "",
            degree: edu.degree || "",
            date: edu.date || "",
          }));
          setValue("education", formattedEdu);
        }

        if (parsedData.experience?.length > 0) {
          const formattedExp = parsedData.experience.map((exp: any) => ({
            companyName: exp?.companyName || "",
            description: exp?.description || "",
            endDate: exp?.endDate || "",
            present: exp?.endDate === "" ? true : false,
            role: exp?.role || "",
            startDate: exp.startDate || "",
          }));
          setValue("experience", formattedExp);
        }
      } else {
        toast.error(response?.error?.message);
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      toast.error("An error occurred while processing the resume.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && <GlobalLoader />}
      <div className="row">
        <div className="col-12">
          {/* Account Type */}
          <div className="d-flex align-items-start mb-3">
            <p
              className="me-3 text-dark fw-medium mb-0"
              style={{ minWidth: "120px" }}
            >
              Account Type <span style={{ color: "red" }}>*</span>
            </p>
            <div className="d-flex flex-wrap gap-4">
              <div className="form-check radio">
                <input
                  {...register("profileType")}
                  className="form-check-input"
                  type="radio"
                  name="profileType"
                  id="TE"
                  value="TE"
                />
                <label className="form-check-label" htmlFor="TE">
                  TalentedXpert
                </label>
              </div>
              <div className="form-check radio">
                <input
                  {...register("profileType")}
                  className="form-check-input"
                  type="radio"
                  name="profileType"
                  id="TR"
                  value="TR"
                />
                <label className="form-check-label" htmlFor="TR">
                  TalentRequestor
                </label>
              </div>
            </div>
          </div>
          {errors.profileType && (
            <div className="text-danger pb-2">{errors.profileType.message}</div>
          )}

          {/* Profile Type */}
          <div className="d-flex align-items-start mb-3">
            <p
              className="me-3 text-dark fw-medium mb-0"
              style={{ minWidth: "120px" }}
            >
              Profile Type <span style={{ color: "red" }}>*</span>
            </p>
            <div className="d-flex flex-wrap gap-4">
              <div className="form-check radio">
                <input
                  {...register("userType")}
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  id="INDIVIDUAL"
                  value="INDIVIDUAL"
                />
                <label className="form-check-label" htmlFor="INDIVIDUAL">
                  Individual
                </label>
              </div>
              <div
                className="form-check radio "
                style={{ marginLeft: "2.1rem" }}
              >
                <input
                  {...register("userType")}
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  id="ORGANIZATION"
                  value="ORGANIZATION"
                />
                <label className="form-check-label" htmlFor="ORGANIZATION">
                  Organization
                </label>
              </div>
            </div>
          </div>
          {errors.userType && (
            <div className="text-danger pb-2">{errors.userType.message}</div>
          )}
        </div>
        {!isOrganization && (
          <>
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label">Resume</label>
                <div className="d-grid gap-2">
                  {/* <button className="btn bg-dark text-light fs-12 rounded-pill" type="button"><Icon icon="uil:upload" className='me-1' /> Upload Resume</button> */}
                  <FileUpload
                    onFileSelect={handleFileResume}
                    label="Upload Resume"
                    accept="application/pdf"
                    type="task"
                    documents={resume}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center mb-3">
              <div
                className="flex-grow-1 me-3"
                style={{ borderTop: "1px solid #666" }}
              ></div>
              <span className="text-daek fw-medium">OR</span>
              <div
                className="flex-grow-1 ms-3"
                style={{ borderTop: "1px solid #666" }}
              ></div>
            </div>
          </>
        )}

        {isOrganization && (
          <>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="organizationName" className="form-label">
                  Organization Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  {...register("organizationName")}
                  type="text"
                  className="form-control bg-dark"
                  placeholder="Organization name"
                  name="organizationName"
                />
                {errors.organizationName && (
                  <div className="text-danger pt-2">
                    {errors.organizationName.message}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="organizationType" className="form-label ">
                  Organization Type <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  {...register("organizationType")}
                  className="form-select bg-light invert"
                  id="taskDropdown"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Organization Type{" "}
                  </option>
                  <option value="COMPANY">Company</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="NON_PROFIT">Non-Profit Organization</option>
                </select>
                {errors.organizationType && (
                  <div className="text-danger pt-2">
                    {errors.organizationType.message}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">
              First Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              {...register("firstName")}
              type="text"
              className="form-control bg-dark"
              placeholder="First name"
              name="firstName"
            />
            {errors.firstName && (
              <div className="text-danger pt-2">{errors.firstName.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label ">
              Last Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              {...register("lastName")}
              type="text"
              className="form-control bg-dark"
              placeholder="Last name"
              aria-label="First name"
            />
            {errors.lastName && (
              <div className="text-danger pt-2">{errors.lastName.message}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              {" "}
              Email Address <span style={{ color: "red" }}>*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              className="form-control bg-dark"
              id="email"
              placeholder="Enter your email"
            ></input>
            {errors.email && (
              <div className="text-danger pt-2">{errors.email.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="mobile" className="form-label">
              {" "}
              Mobile{" "}
            </label>
            <input
              {...register("mobile")}
              type="text"
              className="form-control bg-dark"
              id="mobile"
              placeholder="123456789"
            ></input>
            {errors.mobile && (
              <div className="text-danger pt-2">{errors.mobile.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              Password <span className="text-danger">*</span>
            </label>

            <input
              {...register("password")}
              type={isPasswordVisible ? "text" : "password"}
              id="Password5"
              className="form-control bg-dark"
              aria-describedby="passwordHelpBlock"
              placeholder="*********"
            ></input>
            <div
              className="password-icon"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Icon
                icon={
                  isPasswordVisible ? "mdi:eye-outline" : "mdi:eye-off-outline"
                }
                className="text-placeholder"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            </div>
            {errors.password && (
              <div className="text-danger pt-2">
                {errors.password.message
                  .split("\n")
                  .map((line: any, index: any) => (
                    <div key={index}>{line}</div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3 position-relative">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              {...register("confirmPassword")}
              type={isConfirmPasswordVisible ? "text" : "password"}
              id="confirmPassword"
              className="form-control bg-dark"
              aria-describedby="passwordHelpBlock"
              placeholder="*********"
            ></input>
            <div
              className="password-icon"
              onClick={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              <Icon
                icon={
                  isConfirmPasswordVisible
                    ? "mdi:eye-outline"
                    : "mdi:eye-off-outline"
                }
                className="text-placeholder"
                onClick={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
              />
            </div>
            {errors.confirmPassword && (
              <div className="text-danger pt-2">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3 position-relative">
            <label htmlFor="website" className="form-label">
              Linkedin profile link/website{" "}
            </label>
            <input
              type="text"
              {...register("websiteLink")}
              id="website"
              className="form-control bg-dark"
              placeholder="http/"
            ></input>
            {errors?.websiteLink && (
              <div className="text-danger pb-2">
                {errors?.websiteLink?.message}
              </div>
            )}
          </div>
        </div>
        <div className="text-center mb-4 mt-1">
          <label htmlFor="profilePicture" className="form-label">
            {" "}
            Profile Picture / Logo{" "}
          </label>
          <FileUpload
            onFileSelect={handleFileSelect}
            label="Upload File"
            accept="image/png"
            type="img"
            documents={documents}
          />
        </div>
      </div>
    </div>
  );
};

export default Individual_account;
