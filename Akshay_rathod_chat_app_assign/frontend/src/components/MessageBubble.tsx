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
      className={`msg-bubble ${mine ? "msg-bubble--mine" : "msg-bubble--other"} w-full`}
    >
      {text}
    </div>
  );
}
