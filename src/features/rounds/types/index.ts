import { isAddress, type Address } from "viem";
import { z } from "zod";

export const RoundNameSchema = z.string().max(50);

const RoundVotes = z.object({
  maxVotesTotal: z.number().nullable(),
  maxVotesProject: z.number().nullable(),
});

export const EthAddressSchema = z.custom<string>(
  (val) => isAddress(val as Address),
  "Invalid address",
);

export const RoundVotesSchema = RoundVotes.refine(
  (schema) => (schema?.maxVotesTotal ?? 0) >= (schema?.maxVotesProject ?? 0),
  {
    path: ["maxVotesTotal"],
    message: "Total votes must be at least equal to votes per project",
  },
);

export const calculationTypes = {
  standard: "Standard",
  op: "OP-style",
} as const;

export const CalculationTypeSchema = z
  .enum(Object.keys(calculationTypes) as [string, ...string[]])
  .default("standard");

export const RoundDatesSchema = z.object({
  startsAt: z.date().nullable(),
  reviewAt: z.date().nullable(),
  votingAt: z.date().nullable(),
  resultAt: z.date().nullable(),
  payoutAt: z.date().nullable(),
});
export const RoundSchema = z
  .object({
    id: z.string(),
    name: RoundNameSchema,
    domain: z.string(),
    admins: z.array(EthAddressSchema),
    description: z.string().nullable(),
    network: z.string().nullable(),
    tokenAddress: EthAddressSchema.nullable(),
    calculationType: CalculationTypeSchema,
    calculationConfig: z.record(z.string().or(z.number())).optional(),
  })
  .merge(RoundDatesSchema)
  .merge(RoundVotes);

export type RoundSchema = z.infer<typeof RoundSchema>;