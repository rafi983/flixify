import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// Get all bookmarks for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // Pass as object, not array
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const query = request.nextUrl.searchParams;
    const type = query.get("type"); // e.g., "all" or "selected"

    if (type === "selected") {
      const selectedBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        take: 5, // Example: Fetch only 5 bookmarks
        select: { id: true, videoId: true },
      });
      return new Response(JSON.stringify(selectedBookmarks), { status: 200 });
    }

    // Default: Fetch all bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      select: { id: true, videoId: true },
    });

    return new Response(JSON.stringify(bookmarks), { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/bookmark:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(err) }), { status: 500 });
  }
}

// Add a bookmark for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // Pass as object, not array
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const { videoId } = await request.json();
    const existing = await prisma.bookmark.findFirst({ where: { userId: user.id, videoId } });
    if (existing) {
      return new Response(JSON.stringify({ error: "Already bookmarked" }), { status: 409 });
    }

    const bookmark = await prisma.bookmark.create({
      data: { userId: user.id, videoId },
      select: { id: true, videoId: true },
    });

    return new Response(JSON.stringify(bookmark));
  } catch (err) {
    console.error("Error in POST /api/bookmark:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(err) }), { status: 500 });
  }
}

// Remove a bookmark for the logged-in user
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions); // Pass as object, not array
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  const { videoId } = await request.json();
  await prisma.bookmark.deleteMany({ where: { userId: user.id, videoId } });
  return new Response(JSON.stringify({ success: true }));
}