//A mutation is a function that allows you to contact the backend APIs

"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function FileUpload() {
  const router = useRouter(); //Redirects users to other pages
  const [uploading, setUploading] = React.useState(false);

  const { mutate, isLoading } = useMutation({
    //This defines a function we can use
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      // console.log(`The following file was found: ${file.name}`);
      if (file.size > 10 * 1024 * 1024) {
        //Over 10mb
        toast.error("Please upload a smaller file. The limit is 10 Mb.");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong. Please try again");
          return;
        }
        //This data will contain the NextResonse from route.ts
        mutate(data, {
          onSuccess: (chat_id) => {
            let ID = chat_id["chat_id"];
            /* - Converts the result into a string and gets the value in the dictionary.
             * - If ID >= 100 and doesn't work, it's to do with the line above.
             */
            toast.success("Chat Created!");
            router.push(`/chat/${ID}`);
          },
          onError: (error) => {
            toast.error("Error creating Chat");
            console.error(error);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isLoading ? (
          <>
            {/* Show Loading State */}
            <Loader className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400 ">Loading PDF...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF here!</p>
          </>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
