import type { V2_MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api.js";
import { faker } from "@faker-js/faker";
import { useUser } from "@clerk/clerk-react";

// For demo purposes. In a real app, you'd have real user data.

const NAME = faker.person.firstName();

export const meta: V2_MetaFunction = () => {
  return [
    { title: "My App" },
    { name: "description", content: "Welcome To my app!" },
  ];
};

export default function Index() {
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);
  const [newMessageText, setNewMessageText] = useState("");

  

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container flex flex-col gap-8 p-6 mx-auto text-white bg-gray-900">
    <h1 className="text-4xl font-bold text-center text-white">Remix GPT Chat</h1>
    <h2 className="text-xl font-semibold text-center text-gray-300">Use @gpt to call the LLM.</h2>
    <p className="text-center text-gray-400">
      Connected as <strong className="font-semibold text-white">{NAME}</strong>
    </p>
    
    <div className="flex flex-col gap-4">
      {messages?.map((message) => (
        <article
          key={message._id}
          className={`p-4 border border-gray-700 rounded ${message.author === NAME ? 'bg-gray-800' : 'bg-gray-700'}`}
        >
          <div className="font-semibold text-gray-300">{message.author}</div>
          <p className="text-sm text-gray-400">{message.body}</p>
        </article>
      ))}
    </div>
    
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await sendMessage({ body: newMessageText, author: NAME });
        setNewMessageText("");
      }}
      className="flex items-center gap-4"
    >
      <input
        value={newMessageText}
        onChange={(e) => setNewMessageText(e.target.value)}
        placeholder="Write a message…"
        className="flex-1 p-2 text-white bg-gray-800 border border-gray-700 rounded"
      />
      <button
        type="submit"
        disabled={!newMessageText}
        className={`py-2 px-4 bg-blue-600 text-white rounded ${!newMessageText ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Send
      </button>
    </form>
  </div>
  );
}
