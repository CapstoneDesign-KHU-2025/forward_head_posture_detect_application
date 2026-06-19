export const AVATAR_COLORS = ["#ff9f6b", "#6b9fff", "#ffc46b", "#b06bff", "#6aab7a", "#ff8c8c"];

export function getAvatarColor(id: string | null | undefined) {
  const safeId = (id ?? "").toString();
  if (!safeId.length) {
    return AVATAR_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < safeId.length; i++) {
    hash = safeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitial(name: string | null, id: string | null | undefined) {
  const base = (name && name.length > 0 ? name : (id ?? "")).toString();
  return base.charAt(0).toUpperCase() || "?";
}