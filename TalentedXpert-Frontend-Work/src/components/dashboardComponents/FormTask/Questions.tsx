"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { QuestionType } from "@/services/enums/enums";
import Link from "next/link";

interface Question {
  id?: number;
  question: string;
  type: string;
  options: string[];
}

interface QuestionsProps {
  questionsArr: Question[];
  setQuestionArr: React.Dispatch<React.SetStateAction<Question[]>>;
  setValue: any;
  errors: any;
  getValues: (field: string) => any;
}

const Questions: React.FC<QuestionsProps> = ({
  questionsArr,
  setQuestionArr,
  setValue,
  getValues,
  errors,
}) => {
  const addQuestion = () => {
    const newQuestion: Question = { question: "", type: "TEXT", options: [] };
    const updatedQuestions = [...questionsArr, newQuestion];
    setQuestionArr(updatedQuestions);
    setValue("interviewQuestions", updatedQuestions);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newQuestionArr = [...questionsArr];
    newQuestionArr[index].question = e.target.value;
    setValue("interviewQuestions", newQuestionArr);
    setQuestionArr(newQuestionArr);
  };

  const handleTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const newQuestionArr = [...questionsArr];
    newQuestionArr[index].type = e.target.value;
    if (!["CHECKBOX", "DROPDOWN", "RADIO"].includes(e.target.value)) {
      newQuestionArr[index].options = [];
    }
    setValue("interviewQuestions", newQuestionArr);
    setQuestionArr(newQuestionArr);
  };

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    qIndex: number,
    optIndex: number
  ) => {
    const newQuestionArr = [...questionsArr];
    newQuestionArr[qIndex].options[optIndex] = e.target.value;
    setValue("interviewQuestions", newQuestionArr);
    setQuestionArr(newQuestionArr);
  };

  const addOption = (index: number) => {
    const newQuestionArr = [...questionsArr];
    newQuestionArr[index].options.push("");
    setValue("interviewQuestions", newQuestionArr);
    setQuestionArr(newQuestionArr);
  };

  const deleteOption = (qIndex: number, optIndex: number) => {
    const newQuestionArr = [...questionsArr];
    newQuestionArr[qIndex].options = newQuestionArr[qIndex].options.filter(
      (_, i) => i !== optIndex
    );
    setValue("interviewQuestions", newQuestionArr);
    setQuestionArr(newQuestionArr);
  };

  const onDelete = (index: number) => {
    const deletedQuestionId = questionsArr[index]?.id;
    const updatedQuestions = questionsArr.filter((_, i) => i !== index);
    const currentDeletedIds = getValues("questionIdsToDelete") || [];
    const updatedDeletedIds = deletedQuestionId
      ? [...currentDeletedIds, deletedQuestionId]
      : currentDeletedIds;
    setValue("questionIdsToDelete", updatedDeletedIds);
    setValue("interviewQuestions", updatedQuestions);
    setQuestionArr(updatedQuestions);
  };

  return (
    <div className="mb-3">
      <h6 className="text-dark fs-14 mb-3">Question List</h6>

      {questionsArr.map((data, index) => (
        <div className="mb-4 p-3 border rounded" key={index}>
          <div className="d-flex justify-content-between align-items-center">
            <label className="text-dark">Question {index + 1}</label>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDelete(index)}
            >
              <Icon icon="ri:close-line" width={24} height={24} />
            </button>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-md-6 ">
              <input
                type="text"
                className="form-control invert text-dark"
                value={data.question}
                placeholder={`Enter your question ${index + 1}`}
                onChange={(e) => handleChange(e, index)}
              />
            </div>
            {errors.interviewQuestions?.[index]?.question && (
              <div className="col-md-6">
                <span className="text-danger fs-12">
                  {errors.interviewQuestions[index].question.message}
                </span>
              </div>
            )}
            <div className="col-md-4">
              <select
                className="form-select invert text-dark border-0"
                value={data.type}
                onChange={(e) => handleTypeChange(e, index)}
              >
                {Object.keys(QuestionType).map((key) => {
                  const value = QuestionType[key as keyof typeof QuestionType];
                  return (
                    <option value={key} key={key}>
                      {value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {["CHECKBOX", "DROPDOWN", "RADIO"].includes(data.type) && (
            <div className="mt-3">
              <label className="form-label text-dark fs-14 me-2">Options</label>
              {data.options.map((opt, optIndex) => (
                <div key={optIndex} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control invert text-dark border-0 w-50"
                    value={opt}
                    placeholder={`Option ${optIndex + 1}`}
                    onChange={(e) => handleOptionChange(e, index, optIndex)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={() => deleteOption(index, optIndex)}
                  >
                    <Icon icon="ri:delete-bin-line" width={20} height={20} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-success btn-sm mt-2 ms-2"
                onClick={() => addOption(index)}
              >
                Add Option
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="text-center mt-3">
        <button
          type={"button"}
          className="btn btn-info rounded-pill"
          onClick={addQuestion}
        >
          <Icon icon="ri:add-line" width={24} height={24} /> Add Question
        </button>
      </div>
    </div>
  );
};

export default Questions;
