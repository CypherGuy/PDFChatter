"use client";

import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId], //Not as important as the function
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        //<Message[]> ensures the response type is always an array of type Message
        chatId,
      });
      return response.data;
    },
  });

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      }); // Scroll to bottom of chat window on render.
    }
  }, [messages]);
  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/* Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white ">
        <h3 className="text-xl font-bold">Chat with GPT about your file!</h3>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-o p-2 bg-white overflow-scroll"
      >
        <div className="flex">
          {/* This div above wraps everything in one "row" */}
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="What's your question?"
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4 "></Send>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
