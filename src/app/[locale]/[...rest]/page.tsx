import { notFound } from "next/navigation";

export default function CatchAll() {
  // 정의되지 않은 모든 경로는 여기서 낚아채서 강제로 notFound()를 발생시킵니다.
  // 그러면 비로소 app/[locale]/not-found.tsx 가 화면에 렌더링됩니다!
  notFound();
}
