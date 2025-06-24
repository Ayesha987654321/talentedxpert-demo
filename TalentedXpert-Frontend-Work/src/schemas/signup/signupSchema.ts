import { profile } from "node:console";
import { z } from "zod";

const wordLimit = 200;

export const basicInfoSchema = z.object({
    profileType: z.string().min(2, "Select your type"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    organizationName: z.string().optional(),
    organizationType: z.string().optional(),
    email: z.string().email("Email is required"),
    websiteLink: z.string().optional(),
    profilePicture: z.object({
      key: z.string().optional(),
      fileUrl: z.string().optional()
    }).optional(),
    mobile: z
      .string()
      // .regex(/^\d+$/, "Mobile number must contain only numbers")
      .max(20, "Mobile number must not exceed 20 digits").optional(),
    password: z.string().superRefine((value, ctx) => {
      const errors: string[] = [];

      if (value.length < 8) {
        errors.push("- Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(value)) {
        errors.push("- 1 uppercase letter");
      }
      if (!/[a-zA-Z]/.test(value)) {
        errors.push("- 1 alphabet");
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        errors.push("- 1 special character");
      }

      if (errors.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errors.join("\n"),
        });
      }
    }),
    confirmPassword: z.string().min(8, "Re-entered password must match"),
    userType: z.string(),
    isAdmin: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }
    // if (data.userType === "INDIVIDUAL") {
    //   if (!data.firstName) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: "First Name is required",
    //       path: ["firstName"],
    //     });
    //   }
    //   if (!data.lastName) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: "Last Name is required",
    //       path: ["lastName"],
    //     });
    //   }
    // }

    if (data.userType === "ORGANIZATION") {
      if (!data.organizationName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Organization Name is required",
          path: ["organizationName"],
        });
      }
      if (!data.organizationType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Organization Type is required",
          path: ["organizationType"],
        });
      }
    }
    
  });

  

const education = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

const experience = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Designation is required'),
  startDate: z.string()
    .min(1, "Start date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  endDate: z.string().optional(), // Mark as optional now
  description: z.string().min(1, "Description is required"),
  present: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // If not present, endDate is required
  if (!data.present) {
    if (!data.endDate || data.endDate.trim() === "") {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date is required",
        code: z.ZodIssueCode.custom,
      });
    } else {
      // Also check if it's after startDate
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        ctx.addIssue({
          path: ["endDate"],
          message: "End date must be after start date",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  }
});


const skill = z.object({
  value: z.number(),
  label: z.string(),
});

export const educationSchema = z.object({
  education: z.array(education),
  experience: z.array(experience).optional(),
  disabilityDetail: z.string().optional(),
  isDisabled: z.boolean(),
  
}).refine(
  (data) => !data.isDisabled || (data.isDisabled && data.disabilityDetail),
  {
    message: "Disability detail is required",
    path: ["disabilityDetail"],
  }
);

export const additionalInfoSchema = z
  .object({
    about: z.string().min(1, "About is required").refine(
      (value) => value.trim().split(/\s+/).filter(Boolean).length <= wordLimit,
      { message: `About must not exceed ${wordLimit} words` }
    ),
    skills: z.array(skill).optional(),
    isPromoted: z.string().optional(),
   
    title: z.string().min(1, 'Profile title is required')
  })
  

export const signupSchema = z
  .intersection(z.intersection(basicInfoSchema, educationSchema), additionalInfoSchema)
  .superRefine((data, ctx) => {
    // If profileType is not "TR", skills must have at least one entry
    if (data.profileType !== "TR" && (!data.skills || data.skills.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Skills are required",
        path: ["skills"],
      });
    }
  });