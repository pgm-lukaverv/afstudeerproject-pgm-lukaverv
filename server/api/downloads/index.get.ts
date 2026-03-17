import jwt from "jsonwebtoken";
import { getToken } from "#auth";

export default defineEventHandler(async (event) => {
  // Authenticate user
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
      } catch {
        throw createError({ statusCode: 401, message: "Invalid token" });
      }
    }
  }

  if (!userId) {
    throw createError({ statusCode: 401, message: "Authentication required" });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw createError({ statusCode: 404, message: "Profile not found" });
  }

  // Get all completed order items for this user
  const orderItems = await prisma.orderItem.findMany({
    where: {
      buyerId: profile.id,
      order: { status: "COMPLETED" },
    },
    include: {
      beat: {
        select: {
          id: true,
          title: true,
          coverImage: true,
          audioFile: true,
          bpm: true,
          key: true,
          genre: true,
          producer: {
            select: { username: true },
          },
        },
      },
      order: {
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orderItems.map((item) => ({
    id: item.id,
    beatId: item.beatId,
    title: item.beat.title,
    coverImage: item.beat.coverImage,
    producer: item.beat.producer.username,
    licenseType: item.licenseType,
    price: item.price,
    purchasedAt: item.order.createdAt,
    bpm: item.beat.bpm,
    key: item.beat.key,
    genre: item.beat.genre,
    // File URLs - the actual audio file serves as MP3
    // In a production app, you'd have separate WAV files stored
    files: getFilesForLicense(item.licenseType, item.beat.audioFile),
  }));
});

function getFilesForLicense(licenseType: string, audioFile: string) {
  // Build download URLs based on license type
  // The audioFile is the MP3 file stored in Cloudinary/S3
  const mp3Url = audioFile;
  // For WAV, in production you'd store a separate WAV file
  // For now, we use the same file with a flag to indicate WAV availability
  const wavUrl = audioFile.replace(".mp3", ".wav");

  switch (licenseType) {
    case "BASIC":
      return [{ type: "MP3", url: mp3Url }];
    case "PREMIUM":
      return [
        { type: "MP3", url: mp3Url },
        { type: "WAV", url: wavUrl },
      ];
    case "EXCLUSIVE":
      return [
        { type: "MP3", url: mp3Url },
        { type: "WAV", url: wavUrl },
      ];
    default:
      return [{ type: "MP3", url: mp3Url }];
  }
}
