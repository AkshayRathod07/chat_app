import React from "react";

type MessageBubbleProps = {
  text: string;
  mine?: boolean;
};

export default function MessageBubble({
  text,
  mine = false,
}: MessageBubbleProps) {
  return (
    <div
      className={`max-w-[70%] whitespace-pre-wrap rounded-lg px-3 py-2 ${
        mine ? "bg-indigo-100 self-end" : "bg-gray-100 self-start"
      }`}
    >
      {text}
    </div>
  );
}
