"use server";
import { apiRequest } from "@/lib/api/client";
import { Period, TestInfo } from "../test/page";

type postData = {
  savedAt: string;
  videoDuration: number | null;
  testInfo: TestInfo;
  turtleNeckPeriods: Period[];
  csv: string;
};
export default async function postPostureSessionAction(_prevState: any, data: postData) {
  const result = await apiRequest<string>({
    requestPath: "posture-sessions",
    init: {
      method: "POST",
      body: data,
    },
    tags: ["posture_session"],
  });

  return result;
}
