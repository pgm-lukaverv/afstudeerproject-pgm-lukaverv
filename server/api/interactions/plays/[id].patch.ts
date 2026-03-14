export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Play ID is required" });
  }

  const { listenDuration } = await readBody(event);
  if (typeof listenDuration !== "number" || listenDuration < 0) {
    throw createError({ statusCode: 400, message: "Invalid listenDuration" });
  }

  // Fetch current play to compare durations
  const currentPlay = await prisma.play.findUnique({
    where: { id },
    select: { listenDuration: true },
  });

  if (!currentPlay) {
    throw createError({ statusCode: 404, message: "Play not found" });
  }

  // Only update if new duration is higher (best practice for retention analytics)
  const maxDuration = Math.max(
    currentPlay.listenDuration ?? 0,
    Math.round(listenDuration),
  );

  await prisma.play.update({
    where: { id },
    data: { listenDuration: maxDuration },
  });

  return { success: true };
});
