import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../lib/firebase";

const db = getFirestore(app);

export default function Social() {
  const user = getAuth().currentUser;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "typingStatus"), (snapshot) => {
      const typing = snapshot.docs
        .filter((d) => d.id !== user?.uid)
        .map((d) => d.data().displayName || "Someone");
      setTypingUsers(typing);
    });
    return () => unsubscribe();
  }, [user]);

  const handleTyping = (value: string) => {
    setText(value);
    if (!user) return;

    setDoc(doc(db, "typingStatus", user.uid), {
      displayName: user.displayName || "Anonymous",
      timestamp: serverTimestamp(),
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      deleteDoc(doc(db, "typingStatus", user.uid));
    }, 1500);
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    await addDoc(collection(db, "messages"), {
      text,
      sender: user.displayName || "Anonymous",
      avatar: user.photoURL || "/default-avatar.png",
      timestamp: serverTimestamp(),
    });
    setText("");
    await deleteDoc(doc(db, "typingStatus", user.uid));
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl mb-4">💬 Real-Time Messaging with Typing Indicator</h2>

      <div className="space-y-2 max-h-96 overflow-y-auto border p-4 rounded">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-2">
            <img
              src={msg.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full"
              loading="lazy"
            />
            <div className="bg-gray-100 p-2 rounded-lg max-w-xs break-words">
              <strong>{msg.sender}</strong>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      {typingUsers.length > 0 && (
        <div className="italic text-sm text-gray-600">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      <div className="flex space-x-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onBlur={() => user && deleteDoc(doc(db, "typingStatus", user.uid))}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
