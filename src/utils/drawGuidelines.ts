export function drawGuidelines(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  offsetY: number,
  allInside: boolean
) {
  const guidelineColor = allInside ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 0, 0, 0.6)";

  ctx.save();
  ctx.strokeStyle = guidelineColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 얼굴
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 80 + offsetY, 90, 110, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 목
  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY + 10 + offsetY);
  ctx.lineTo(centerX - 35, centerY + 40 + offsetY);
  ctx.moveTo(centerX + 40, centerY + 10 + offsetY);
  ctx.lineTo(centerX + 35, centerY + 40 + offsetY);
  ctx.stroke();

  // 어깨
  ctx.beginPath();
  ctx.moveTo(centerX - 35, centerY + 40 + offsetY);
  ctx.lineTo(centerX - 190, centerY + 60 + offsetY);
  ctx.moveTo(centerX + 35, centerY + 40 + offsetY);
  ctx.lineTo(centerX + 190, centerY + 60 + offsetY);
  ctx.stroke();

  // 상체
  ctx.beginPath();
  ctx.moveTo(centerX - 190, centerY + 60 + offsetY);
  ctx.bezierCurveTo(
    centerX - 200,
    centerY + 150 + offsetY,
    centerX - 215,
    centerY + 220 + offsetY,
    centerX - 225,
    centerY + 280 + offsetY
  );

  ctx.moveTo(centerX + 190, centerY + 60 + offsetY);
  ctx.bezierCurveTo(
    centerX + 200,
    centerY + 150 + offsetY,
    centerX + 215,
    centerY + 220 + offsetY,
    centerX + 225,
    centerY + 280 + offsetY
  );

  ctx.moveTo(centerX - 225, centerY + 280 + offsetY);
  ctx.lineTo(centerX + 225, centerY + 280 + offsetY);
  ctx.stroke();

  ctx.restore();
}
