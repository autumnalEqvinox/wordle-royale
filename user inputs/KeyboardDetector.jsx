"use client"; 

import { useEffect, useState } from "react";

const MAX_LENGTH = 5; //Maximum number of characters allowed, like wordle

export default function KeyboardDetector() {
  const [text, setText] = useState(""); //where the currently typed text is stored
  const [lastKey, setLastKey] = useState(null); //shows what the last typed key is, for testing purposes
  const [submitted, setSubmitted] = useState([]); // shows the currently submitted words, for testing purposes


  //this will lsiten for keyboard inputs 
  useEffect(() => { 
    const handleKeyDown = (event) => { //runs on every key press
      setLastKey(event.key); //save's the last key press and sends it to line 9
      if (event.key === "Backspace") { //if there is a backspace, remove the last character
        setText((prev) => prev.slice(0, -1)); //slice(0, -1) returns everything except last character
      } else if (event.key === "Enter") { //if there is an enter, save the current word and then delete what has been inputted
        setText((prev) => { 
          if (prev.trim()) setSubmitted((lines) => [...lines, prev]);
          return "";
        });
      } else if (
        /^[a-zA-Z]$/.test(event.key) && //rejects non-letter characters, like tabs and shifts
        !event.ctrlKey && //if the ctrl key  then it ignores any characters typed afterwards, so you can use shortcuts like ctrl + c or ctrl + v
        !event.metaKey //does the same for the cmd key on mac
      ) {
        setText((prev) => (prev.length < MAX_LENGTH ? prev + event.key : prev)); //if the word is under 5 letters, then it adds the letter
      }
    };

    window.addEventListener("keydown", handleKeyDown); //tells the browser to call 'handleKeyDown' everytime a key is pressed
    return () => window.removeEventListener("keydown", handleKeyDown); //removes the listener when unmounted, avoiding leaks
  }, []);

  return (
    //formatting for test UI 
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <p>Last key pressed: <strong>{lastKey ?? "none yet"}</strong></p>
      <p>Current text: <strong>{text || "(start typing)"}</strong></p>

      <h3>Submitted with Enter</h3>
      <ul>
        {submitted.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
