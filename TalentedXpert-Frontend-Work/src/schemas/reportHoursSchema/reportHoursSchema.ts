import { z } from "zod"

const docs = z.object({
  key: z.string(),
  fileUrl: z.string()
}).optional();
export const reportHoursSchema = z.object({

  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  comment: z.string(),
  TEProfileId: z.number(),
  taskId: z.number(),
  amount: z.number(),
  date: z.string(),
  documents: z.array(docs).optional()

})