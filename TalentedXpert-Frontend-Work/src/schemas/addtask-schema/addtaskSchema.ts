import { z } from "zod";

const notBeforeToday = (date: string) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const addtaskSchema = z
  .object({
    name: z.string().min(1, "Add task Name"),
    amount: z.string().min(1, "Please add amount"),
    details: z.string().min(1, "Add details"),
    disability: z.string().optional(),
    startDate: z
      .string()
      .min(1, "Add start date")
      .refine((date) => notBeforeToday(date), {
        message: "Start date cannot be earlier than today",
      }),
    endDate: z
      .string()
      .min(1, "Add end date")
      .refine((date) => notBeforeToday(date), {
        message: "End date cannot be earlier than today",
      }),
    amountType: z
      .string({
        required_error: "Add amount type",
        invalid_type_error: "Add amount type",
      })
      .min(1, "Add amount type"),
    category: z.string().min(1, "Category is required"),
    subCategory: z
      .array(
        z
          .object({
            value: z.number(),
            label: z.string(),
          })
          .optional()
      )
      .optional(),
    taskType: z
      .string({
        required_error: "Select Task Location",
        invalid_type_error: "Select Task Location",
      })
      .min(1, "Select Task Location"),
    status: z.string(),
    documents: z.array(
      z.object({
        key: z.string(),
        fileUrl: z.string(),
      })
    ),
    interviewQuestions: z.array(
      z.object({
        id: z.number().optional(),
        question: z.string().min(1, "Add question"),
        type: z.string(),
        options: z.array(z.string()),
      })
    ),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    street: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(), // Make address optional
    longitude: z.string(),
    latitude: z.string(),
    requesterProfileId: z.string(),
    promoted: z.string(),
    categoryIdsToDelete: z.array(z.number()),
    questionIdsToDelete: z.array(z.number()),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate >= startDate;
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["endDate"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.taskType === "ONSITE") {
      // if (!data.city?.trim()) {
      //   ctx.addIssue({
      //     path: ["city"],
      //     code: z.ZodIssueCode.custom,
      //     message: "City is required for onsite tasks",
      //   });
      // }
      // if (!data.state?.trim()) {
      //   ctx.addIssue({
      //     path: ["state"],
      //     code: z.ZodIssueCode.custom,
      //     message: "State is required for onsite tasks",
      //   });
      // }
      // if (!data.country?.trim()) {
      //   ctx.addIssue({
      //     path: ["country"],
      //     code: z.ZodIssueCode.custom,
      //     message: "Country is required for onsite tasks",
      //   });
      // }
      if (!data.address?.trim()) {
        ctx.addIssue({
          path: ["address"],
          code: z.ZodIssueCode.custom,
          message: "Address is required for onsite tasks",
        });
      }
    }
  });
