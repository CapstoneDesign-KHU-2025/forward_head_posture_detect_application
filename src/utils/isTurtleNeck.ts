export default function isTurtleNeck(
  ear_points: { xl: number; yl: number; xr: number; yr: number; z1: number; z2: number },
  shoulder_points: { xl: number; yl: number; xr: number; yr: number; z1: number; z2: number }
) {
  const ear_middle_point_y = ear_points["yl"] + (ear_points["yr"] - ear_points["yl"]) / 2;
  const ear_middle_point_z = (ear_points["z2"] + ear_points["z1"]) / 2;

  const shoulder_middle_point_y = shoulder_points["yl"] + (shoulder_points["yr"] - shoulder_points["yl"]) / 2;
  const shoulder_middle_point_z = (shoulder_points["z2"] + shoulder_points["z1"]) / 2;

  const tan_theta =
    Math.abs(ear_middle_point_z - shoulder_middle_point_z) / Math.abs(ear_middle_point_y - shoulder_middle_point_y);

  const angleInRaians = Math.atan(tan_theta);
  const angleInDegrees = angleInRaians * (180 / Math.PI);
  console.log(angleInDegrees);
  if (angleInDegrees > 49) return true;
  else return false;
}
