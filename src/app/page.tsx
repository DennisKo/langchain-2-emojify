"use client";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const promptInput = useRef<HTMLTextAreaElement>(null);

  const handlePrompt = () => {
    if (promptInput && promptInput.current) {
      setAnswer("");
      const prompt = promptInput.current.value;
      setLoading(true);
      promptInput.current.value = "";
      fetchEventSource("http://localhost:3000/api", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        onmessage: (event) => {
          setLoading(false);
          if (event.data === "DONE") {
          } else {
            setAnswer((prev) => prev + event.data);
          }
        },
        onclose: () => {
          promptInput.current?.focus();
        },
      });
    }
  };

  const handlePromptKey = async (e) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePrompt();
    }
  };

  // focus input on page load
  useEffect(() => {
    if (promptInput && promptInput.current) {
      promptInput.current.focus();
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center h-screen w-[500px] ml-auto mr-auto">
      <div className="flex items-center w-full">
        <div className="mr-4">
          <label htmlFor="prompt" className="sr-only">
            Prompt
          </label>
          <TextareaAutosize
            ref={promptInput}
            name="prompt"
            id="prompt"
            rows={3}
            maxRows={6}
            onKeyDown={handlePromptKey}
            className="block rounded-md resize-none border-0 w-[300px] py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="I like chocolate ice cream"
          />
        </div>
        <div className="w-full">
          <button
            onClick={handlePrompt}
            type="button"
            className="rounded-md w-full bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Emojify!
          </button>
        </div>
      </div>
      <div className="bg-gray-800 p-4 w-full mt-8 min-h-[300px] text-gray-50 rounded-md text-9xl flex justify-center items-center">
        {loading ? "..." : answer}
      </div>
    </main>
  );
}
