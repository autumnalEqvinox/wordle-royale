"use client"; 

import { useEffect, useState } from "react";

const MAX_LENGTH = 5; //Maximum number of characters allowed, like wordle

export default function KeyboardDetector({
    text, 
    setText, 
    handleEnter,
    setSubmitted,
    setPressedKey,
  }) {
  // // const [text, setText] = useState(""); //where the currently typed text is stored
  const [lastKey, setLastKey] = useState(null); //shows what the last typed key is, for testing purposes
  // const [submitted, setSubmitted] = useState([]); // shows the currently submitted words, for testing purposes

  //this will listen for keyboard inputs 
  useEffect(() => { 
    const handleKeyDown = (event) => { //runs on every key press
      setLastKey(event.key); //save's the last key press and sends it to line 9
      setPressedKey(event.key.toUpperCase()); 

      if (event.ctrlKey || event.metaKey || event.altKey) { // not listening for control, any meta keys, or the alt key
        return;
      }

      if (event.key === "Backspace") { //if there is a backspace, remove the last character
        event.preventDefault();
        setText((prev) => prev.slice(0, -1)); //slice(0, -1) returns everything except last character
      } 
      
      else if (event.key === "Enter") { //if there is an enter, save the current word and then delete what has been inputted
        event.preventDefault();
        handleEnter(); // used to display pop up window when enter is pressed on the keyboard
        
        if (text.length === MAX_LENGTH) {
          setSubmitted((lines) => [...lines, text]); // append the text to the submitted guesses
          setText(""); // clear the text since we are on a new guess attempt
        }
      } 
      
      else if (
        /^[a-zA-Z]$/.test(event.key) && //rejects non-letter characters, like tabs and shifts
        !event.ctrlKey && //if the ctrl key  then it ignores any characters typed afterwards, so you can use shortcuts like ctrl + c or ctrl + v
        !event.metaKey //does the same for the cmd key on mac
      ) 
      
      {
        setText(
          (prev) => 
            (prev.length < MAX_LENGTH 
              ? prev + event.key.toUpperCase()
              : prev)
        ); //if the word is under 5 letters, then it adds the letter

      }
    };

    const handleKeyUp = (event) => {
      setPressedKey((current) => 
        current === event.key.toUpperCase() ? "" : current
      );
    };

    window.addEventListener("keydown", handleKeyDown); //tells the browser to call 'handleKeyDown' everytime a key is pressed
    window.addEventListener("keyup", handleKeyUp); // when teh user lets up on the key
    return () => 
      {
        window.removeEventListener("keydown", handleKeyDown); //removes the listener when unmounted, avoiding leaks
        window.removeEventListener("keyup", handleKeyUp);
      }
  }, [text, setText, setSubmitted]);

  return null;

}








// used chat to figure out how to get the letters to flash. I knew to use event.key, but had chat show me the process in doing keyup. 
// Sam C