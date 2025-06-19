import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY");
      throw new Error("GROQ_API_KEY environment variable is not set");
    }

    const { message, history, userId } = await req.json();
    if (!userId || !message) {
      console.error("Missing required fields:", { userId, message });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch notes and tags from Firestore using Admin SDK
    const notesSnap = await db
      .collection("users")
      .doc(userId)
      .collection("notes")
      .get();
    const tagsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("tags")
      .get();
    const notes = notesSnap.docs.map((doc) => doc.data());
    const tags = tagsSnap.docs.map((doc) => doc.data());

    // Build notes/tags lists for the prompt
    const notesList =
      notes && notes.length > 0
        ? notes
            .map(
              (n: any, i: number) =>
                `Note ${i + 1}: "${n.title}" - ${
                  n.content?.slice(0, 100) || ""
                }...`
            )
            .join("\n")
        : "No notes.";

    const tagsList =
      tags && tags.length > 0
        ? tags.map((t: any) => t.name).join(", ")
        : "No tags.";

    // Explicit, example-rich system prompt
    const systemPrompt = `
You are a helpful assistant. Here are the user's notes and tags:

Notes:
${notesList}

Tags:
${tagsList}

When answering:
1. FIRST check if there are notes/tags listed above.
2. If notes exist, reference them like: "In your notes about [TITLE]..."
3. NEVER say "you don't have notes" if notes are listed.
4. If no notes exist, suggest creating some.

Example response when notes exist:
"I see you have a note titled '${
      notes?.[0]?.title || "Example Note"
    }' that mentions [RELEVANT DETAILS]..."

Current notes (only reference these, don't list them unless asked directly):
${notesList}
`;

    // Log for debugging
    console.log("---- SYSTEM PROMPT ----\n", systemPrompt);

    const validHistory = Array.isArray(history) ? history : [];
    const messages = [
      { role: "system", content: systemPrompt },
      ...validHistory.map((msg: any) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.message || "",
      })),
      { role: "user", content: message },
    ];

    // Log messages
    console.log(
      "---- MESSAGES SENT TO GROQ ----\n",
      JSON.stringify(messages, null, 2)
    );

    // Call Groq API
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages,
          temperature: 0.7,
          top_p: 0.3,
        }),
      }
    );

    if (!groqRes.ok) {
      const errorBody = await groqRes.text();
      console.error("---- GROQ API ERROR ----", groqRes.status, errorBody);
      return NextResponse.json(
        { error: `Groq API Error: ${groqRes.statusText}` },
        { status: 500 }
      );
    }

    const groqData = await groqRes.json();
    console.log(
      "---- GROQ API RESPONSE ----\n",
      JSON.stringify(groqData, null, 2)
    );

    const aiMessage =
      groqData.choices?.[0]?.message?.content || "No response generated";

    return NextResponse.json({ aiMessage });
  } catch (error: any) {
    console.error("---- API ROUTE ERROR ----", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
