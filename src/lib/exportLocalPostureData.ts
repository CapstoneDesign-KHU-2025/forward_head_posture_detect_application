import { getDB } from "./idb";

export async function exportLocalPostureData() {
  //indexedDB 에서 posture 데이터, hourly 데이터 모두 가져오기
  const db = await getDB();
  // samples: {
  //     key: number;
  //     value: {
  //       id?: number;
  //       userId: string;
  //       ts: number;
  //       angleDeg: number;
  //       isTurtle: boolean;
  //       hasPose: boolean;
  //       sessionId?: string;
  //       sampleGapS?: number;
  //       uploadedFlag?: 0 | 1;
  //     };
  //     indexes: {
  //       byTs: number;
  //       byUserTs: [string, number];
  //       byUploadedFlag: 0 | 1;
  //     };
  //   };

  //   hourly: {
  //     key: [string, number];
  //     value: {
  //       userId: string;
  //       hourStartTs: number;
  //       sumWeighted: number;
  //       weight: number;
  //       count: number;
  //       avgAngle?: number | null;
  //       finalized: 0 | 1;
  //     };
  //     indexes: {
  //       byUser: string;
  //       byUserHour: [string, number];
  //     };
  //   };
  // }
  const allData = await db.getAll("samples");
  const allHourlyAverages = await db.getAll("hourly");

  return { samples: allData, hourly: allHourlyAverages };
}
