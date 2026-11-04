import { onCall } from "firebase-functions/v2/https";

export const testFunction = onCall((request) => {
    return {
        message: "Wordle backend works!"
    };
});