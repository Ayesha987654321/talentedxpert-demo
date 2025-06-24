import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comments: z.string().min(1, { message: "Comments are required" }),
  taskId: z.number(),
  reviewerProfileId: z.number(),
  revieweeProfileId: z.number(),
});
