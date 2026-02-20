"use server";
import { apiRequest } from "@/lib/api/client";
import { Period, TestInfo } from "../test/page";
import { z } from "zod";

const postDataSchema = z.object({
  savedAt: z.string(),
  videoDuration: z.number().nullable(),
  testInfo: z.object({
    monitorDistance: z.number(),
    monitorHight: z.number(),
    angleBetweenBodyAndCam: z.number(),
    isHairTied: z.boolean(),
    turtleNeckLevel: z.enum(["none", "mild", "severe"]),
  }),
  turtleNeckPeriods: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      duration: z.number(),
    })
  ),
  csv: z.string(),
});

type postData = {
  savedAt: string;
  videoDuration: number | null;
  testInfo: TestInfo;
  turtleNeckPeriods: Period[];
  csv: string;
};

export default async function postPostureSessionAction(_prevState: any, data: postData) {
  const parsed = postDataSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Invalid input" } as const;
  }

  const result = await apiRequest<string>({
    requestPath: "posture-sessions",
    init: {
      method: "POST",
      body: parsed.data,
    },
    tags: ["posture_session"],
  });

  return result;
}
