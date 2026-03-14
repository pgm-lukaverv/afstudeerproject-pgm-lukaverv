import jwt from "jsonwebtoken";
import { getToken } from "#auth";

type Period = "week" | "month" | "year" | "all";

function getStartDate(period: Period): Date | undefined {
  if (period === "all") return undefined;
  const now = new Date();
  const d = now.getDay();
  const starts: Record<Exclude<Period, "all">, Date> = {
    week: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (d === 0 ? 6 : d - 1),
    ),
    month: new Date(now.getFullYear(), now.getMonth(), 1),
    year: new Date(now.getFullYear(), 0, 1),
  };
  return starts[period];
}

async function getUserId(event: any): Promise<string | null> {
  // Try OAuth session first
  const token = await getToken({ event });
  if (token?.email) {
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      select: { id: true },
    });
    if (user) return user.id;
  }

  // Fallback to JWT cookie
  const authToken = getCookie(event, "auth_token");
  if (authToken) {
    try {
      const decoded = jwt.verify(
        authToken,
        process.env.JWT_SECRET || "your-secret-key",
      ) as { id: string };
      return decoded.id;
    } catch {}
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const period = (getQuery(event).period as Period) || "all";
  const startDate = getStartDate(period);
  const dateFilter = startDate ? { gte: startDate } : undefined;

  const userId = await getUserId(event);
  if (!userId) throw createError({ statusCode: 401, message: "Unauthorized" });

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile)
    throw createError({ statusCode: 404, message: "Profile not found" });

  const { id: profileId } = profile;

  const [beatsWithPlays, topFans] = await Promise.all([
    // All beats with play/like/comment counts filtered by period
    prisma.beat.findMany({
      where: { producerId: profileId },
      include: {
        _count: {
          select: {
            plays: dateFilter ? { where: { createdAt: dateFilter } } : true,
            likes: dateFilter ? { where: { createdAt: dateFilter } } : true,
            comments: dateFilter ? { where: { createdAt: dateFilter } } : true,
          },
        },
      },
    }),

    // Top 5 fans by play count within period
    prisma.play.groupBy({
      by: ["profileId"],
      where: {
        beat: { producerId: profileId },
        profileId: { not: null },
        ...(dateFilter && { createdAt: dateFilter }),
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  // Only include beats with plays in the selected period, sort by play count, take top 5
  const topTracks = beatsWithPlays
    .filter((b) => b._count.plays > 0)
    .sort((a, b) => b._count.plays - a._count.plays)
    .slice(0, 5);

  // Hydrate fan entries with profile data
  const fanProfileIds = topFans
    .map((f) => f.profileId)
    .filter(Boolean) as string[];
  const fanProfiles = await prisma.profile.findMany({
    where: { id: { in: fanProfileIds } },
    select: { id: true, userId: true, username: true, profilePicture: true },
  });

  const fanMap = new Map(fanProfiles.map((p) => [p.id, p]));

  return {
    topTracks: topTracks.map((beat) => ({
      id: beat.id,
      title: beat.title,
      plays: beat._count.plays,
      likes: beat._count.likes,
      comments: beat._count.comments,
      bpm: beat.bpm,
      image: beat.coverImage,
    })),
    topFans: topFans.map((fan) => {
      const p = fanMap.get(fan.profileId!);
      return {
        username: p?.username ?? "Unknown User",
        userId: p?.userId ?? null,
        profilePicture: p?.profilePicture ?? null,
        plays: fan._count.id,
      };
    }),
  };
});
