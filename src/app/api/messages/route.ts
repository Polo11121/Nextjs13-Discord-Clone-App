import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export const GET = async (req: Request) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return new NextResponse("Channel Id is required", {
        status: 422,
      });
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[messages.length - 1].id;
    }

    return new NextResponse(
      JSON.stringify({
        messages,
        nextCursor,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("[MESSAGES_GET]", error);

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};
