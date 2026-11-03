"use client"; // markes file as a client component 

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, push, set, remove, onValue, onDisconnect } from "firebase/database";
import { auth, rtdb } from "@/app/lib/firebase";

export default function PlayerSession() {
    useEffect(() => {
        let activeConnection = null;
        let stopped = false; 

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return; 

            const connectedRef = ref(rtdb, ".info/connected");

            const unsubscribeConnection = onValue(
                connectedRef,
                async (snapshot) => {
                    if (snapshot.val() !== true || stopped) return;
                    const connectionsRef = ref(
                        rtdb,
                        `presence/${user.uid}/connections`
                    );

                    const connectionRef = push(connectionsRef);
                    activeConnection = connectionRef;

                    try { 
                        // register before going online this is so unexpected player disconnecting doesn't leave online record 
                        await onDisconnect(connectionRef).remove();

                        if (stopped) {
                            await onDisconnect(connectionRef).cancel();
                            return;
                        }

                        await set(connectionRef, true); // registers automatic removal before it writes online status
                        console.log("Player is now online:", user.uid);
                    } catch (error) {
                        console.error("Presence error:", error);
                    }
                }
            );

            cleanupConnectionListener = unsubscribeConnection;
        });

        let cleanupConnectionListener = () => {};

        return () => {
            stopped = true; 
            unsubscribeAuth();
            cleanupConnectionListener();

            if (activeConnection) { 
                void remove(activeConnection).catch(console.error);
            }
        };
    }, []);
    return null; // this component does not render anything
}