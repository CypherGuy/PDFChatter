//Routes to /api/cheate-chat

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(`File key, File name: ${file_key}, ${file_name}`);
    await loadS3IntoPinecone(file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    //The ID at the end of the URL
    let id = chat_id[0].insertedId;
    console.log(`Chat ID in Route.ts before Mutate: ${id}`);
    return NextResponse.json({ chat_id: id }, { status: 200 });
    /* Note it's chat_id[0] as db.insert returns the dictionary we put into it.
     * As we only put in one dictionary, only one is outputted.
     */
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { Error: "internal server error" },
      { status: 500 }
    );
  }
}
