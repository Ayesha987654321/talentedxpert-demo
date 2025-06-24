import { dataForServer } from "@/models/reviewModel/reviewModel";
import { reviewSchema } from "@/schemas/submitReview-schema/submitReviewSchema";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import React, { FC, useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as bootstrap from 'bootstrap';
import { toast } from "react-toastify";
import { z } from "zod";

const SubmitReview: FC<any> = ({
  taskId,
  revieweeId,
}: {
  taskId: number;
  revieweeId: number;
}) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  type FormSchemaType = z.infer<typeof reviewSchema>;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0); // Track rating value
  const closeBtnRef = useRef<any>(null);
    console.log('revieweeId',revieweeId, typeof(revieweeId))

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormSchemaType>({
    defaultValues: {
      comments: "",
      rating: 0,
      taskId: Number(taskId),
      reviewerProfileId: Number(user?.profile[0]?.id),
      revieweeProfileId: revieweeId,
    },
    resolver: zodResolver(reviewSchema),
    mode: "all",
  });

  useEffect(()=>{
    
    setValue('revieweeProfileId',revieweeId)

  },[revieweeId])

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    console.log('submit')
    setIsSubmitting(true);
    setValue('revieweeProfileId' , revieweeId)
    const formData = dataForServer(data);

    try {
      const res = await apiCall(
        requests.reviews,
        formData,
        "post",
        true,
        dispatch,
        user,
        router
      );

      if (res?.error) {
        const message = res?.error?.message;
        if (Array.isArray(message)) {
          message?.map((msg: string) =>
            toast.error(msg || "Something went wrong, please try again")
          );
        } else {
          toast.error(message || "Something went wrong, please try again");
        }
      } else {
        toast.success(res?.data?.message);
        closeBtnRef.current?.click();
        router.push(`/dashboard/tasks/${taskId}`);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

      console.log('err', errors)


  const handleDisputeClick = () => {
    const secondModal = new bootstrap.Modal(document.getElementById('exampleModalToggle11')!);
    secondModal.show();
  };


  return (
    <div>
      <div className="ad-review">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="modal fade"
            id="exampleModalToggle88"
            aria-hidden="true"
            aria-labelledby="exampleModalToggleLabe88"
            tabIndex={1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5
                    className="modal-title text-white"
                    id="exampleModalToggleLabe88"
                  >
                    Add Review
                  </h5>
                  <button
                    type="button"
                    className="btn-close bg-light"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    ref={closeBtnRef}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label me-4"
                    >
                      Add Rating :
                    </label>
                    <div className="stars d-flex">
                      <Controller
                        name="rating"
                        control={control}
                        render={({ field }) => (
                          <div className="d-flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon
                                key={star}
                                icon={
                                  star <= field.value
                                    ? "ic:baseline-star"
                                    : "mdi-light:star"
                                }
                                className={
                                  star <= field.value
                                    ? "text-warning"
                                    : "text-light"
                                }
                                onClick={() => {
                                  field.onChange(star);
                                  setRating(star); // Update rating state
                                }}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "2rem",
                                  marginRight: "5px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  {errors.rating && (
                    <div className="text-danger pt-2 mb-2">
                      {errors.rating.message}
                    </div>
                  )}
                  {rating > 0 && rating < 3 && (
                    <div className="text-danger pt-2 mb-2">
                      It seems like you are not satisfied with the work. Please
                      open a dispute to resolve the issue.
                    </div>
                  )}
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlTextarea1"
                      className="form-label"
                    >
                      Comments
                    </label>
                    <textarea
                      {...register("comments")}
                      className="form-control"
                      id="exampleFormControlTextarea1"
                      rows={3}
                    ></textarea>
                    {errors.comments && (
                      <div className="text-danger pt-2 mb-2">
                        {errors.comments.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="d-grid gap-2">
                    {rating > 0 && rating < 3 && (
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleDisputeClick}
                        data-bs-dismiss="modal"
                        aria-label="Close"

                      >
                        Open Dispute
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={rating > 0 && rating < 3} // Disable submit if rating < 3
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReview;