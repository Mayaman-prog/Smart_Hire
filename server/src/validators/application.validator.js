const { z } = require("zod");

const applySchema = z.object({
  jobId: z.number().int().positive(),
  cover_letter: z.string().optional(),
  coverLetter: z.string().optional(),
});

const statusSchema = z.object({
  status: z
    .string()
    .min(1)
    .transform((val) => val.trim().toLowerCase()),
});

module.exports = { applySchema, statusSchema };