// scripts/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) 유저 하나 생성 (id 명시적으로 "noah"로)
  const user = await prisma.user.upsert({
    where: { id: "noah" },
    update: {},
    create: {
      id: "noah",
      name: "노아",
      email: "noah@example.com",
    },
  });

  console.log("✅ User upsert:", user);

  // 2) 오늘 날짜 기준 DailyPostureSummary 하나 만들기
  const today = new Date();
  today.setHours(0, 0, 0, 0); // @db.Date라서 시간은 00:00으로 맞춰주는 게 안전

  const sumWeighted = 36000; // 예: 각도 10°를 3600초 동안 (10 * 3600)
  const weightSeconds = 3600; // 1시간 사용
  const count = 360; // 10초마다 샘플 수집했다고 가정
  const avgAngle = sumWeighted / weightSeconds; // 10°

  const daily = await prisma.dailyPostureSummary.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    create: {
      userId: user.id,
      date: today,
      sumWeighted,
      weightSeconds,
      count,
      avgAngle,
    },
    update: {
      sumWeighted,
      weightSeconds,
      count,
      avgAngle,
    },
  });

  console.log("✅ DailyPostureSummary upsert:", daily);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
