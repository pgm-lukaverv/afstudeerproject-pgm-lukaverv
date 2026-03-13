import jwt from "jsonwebtoken";
import { getToken } from "#auth";

type Period = "week" | "month" | "year" | "all";

function getDateRange(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "week": {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setDate(now.getDate() - 27);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return d;
    }
    case "all":
    default: {
      return new Date("2020-01-01");
    }
  }
}

function getBucketKey(date: Date, period: Period): string {
  switch (period) {
    case "week":
      return date.toISOString().split("T")[0]!;
    case "month": {
      // Group into 4 weekly buckets relative to today
      const now = new Date();
      const daysAgo = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysAgo < 7) return "week-1";
      if (daysAgo < 14) return "week-2";
      if (daysAgo < 21) return "week-3";
      return "week-4";
    }
    case "year":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case "all":
      return String(date.getFullYear());
  }
}

function initBuckets(period: Period): string[] {
  const now = new Date();
  switch (period) {
    case "week": {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        return d.toISOString().split("T")[0]!;
      });
    }
    case "month":
      return ["week-4", "week-3", "week-2", "week-1"];
    case "year": {
      const year = now.getFullYear();
      return Array.from(
        { length: 12 },
        (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`,
      );
    }
    case "all": {
      const currentYear = now.getFullYear();
      const result: string[] = [];
      for (let y = 2023; y <= currentYear; y++) result.push(String(y));
      return result;
    }
  }
}

function buildLabels(buckets: string[], period: Period): string[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  switch (period) {
    case "week":
      return buckets.map((key) => {
        const [y, m, d] = key.split("-").map(Number);
        const date = new Date(y!, m! - 1, d!);
        return `${dayNames[date.getDay()]} ${d}`;
      });
    case "month":
      return ["Week 1", "Week 2", "Week 3", "Week 4"];
    case "year":
      return buckets.map(
        (key) => monthNames[parseInt(key.split("-")[1]!) - 1]!,
      );
    case "all":
      return buckets;
  }
}

function countByBucket(
  dates: Date[],
  buckets: string[],
  period: Period,
): number[] {
  const map: Record<string, number> = {};
  for (const b of buckets) map[b] = 0;
  for (const d of dates) {
    const key = getBucketKey(d, period);
    if (map[key] !== undefined) map[key]++;
  }
  return buckets.map((b) => map[b] ?? 0);
}

export default defineEventHandler(async (event) => {
  try {
    const period = (getQuery(event).period as Period) || "week";

    // Auth — same pattern as other dashboard endpoints
    let userId: string | null = null;

    const token = await getToken({ event });
    if (token?.email) {
      const oauthUser = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: { id: true },
      });
      if (oauthUser) userId = oauthUser.id;
    }

    if (!userId) {
      const authToken = getCookie(event, "auth_token");
      if (authToken) {
        try {
          const decoded = jwt.verify(
            authToken,
            process.env.JWT_SECRET || "your-secret-key",
          ) as { id: string };
          userId = decoded.id;
        } catch {}
      }
    }

    if (!userId) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw createError({ statusCode: 404, message: "Profile not found" });
    }

    const profileId = profile.id;
    const startDate = getDateRange(period);

    // Fetch all four metrics in parallel
    const [plays, likes, comments, follows] = await Promise.all([
      prisma.play.findMany({
        where: {
          beat: { producerId: profileId },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      prisma.like.findMany({
        where: {
          beat: { producerId: profileId },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      prisma.comment.findMany({
        where: {
          beat: { producerId: profileId },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      prisma.follow.findMany({
        where: { followingProfileId: profileId, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const buckets = initBuckets(period);
    const labels = buildLabels(buckets, period);

    return {
      labels,
      plays: countByBucket(
        plays.map((p) => p.createdAt),
        buckets,
        period,
      ),
      likes: countByBucket(
        likes.map((l) => l.createdAt),
        buckets,
        period,
      ),
      comments: countByBucket(
        comments.map((c) => c.createdAt),
        buckets,
        period,
      ),
      follows: countByBucket(
        follows.map((f) => f.createdAt),
        buckets,
        period,
      ),
    };
  } catch (error: any) {
    console.error("Chart API error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch chart data",
    });
  }
});
