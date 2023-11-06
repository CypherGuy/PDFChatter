import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, LogIn, LogInIcon } from "lucide-react";
import { checkSubscription } from "@/lib/subscription";
import FileUpload from "@/components/FileUpload";
import SubscriptionButton from "@/components/SubscriptionButton";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

//https://hypercolor.dev/ for bg

export default async function Home() {
  const { userId } = await auth();
  // !! turns null into Boolean
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  return (
    <div className="w-screen min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900">
      {/* Centralises content to middle-middle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Talk to any PDF!</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2 ">
            {/* If isAuth: Display the "Go to chats" button  */}
            {isAuth && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>
                  Go to Chats
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            )}
            <div className="ml-3">
              <SubscriptionButton isPro={isPro} />
            </div>
          </div>
          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Help answer questions and understand information better using AI
          </p>
          {/* File upload sign */}
          <div className="w-full mt-4 ">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
