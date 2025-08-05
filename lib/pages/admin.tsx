import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) return router.push("/login");
    const fetchData = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const courseSnapshot = await getDocs(collection(db, "courses"));
      setUsers(userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setCourses(courseSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [user]);

  const deleteCourse = async (id: string) => {
    await deleteDoc(doc(db, "courses", id));
    setCourses(courses.filter((course) => course.id !== id));
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const storageRef = ref(storage, `avatars/${userId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "users", userId), { avatarUrl: url });
    setUsers(users.map((u) => (u.id === userId ? { ...u, avatarUrl: url } : u)));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <h2 className="text-xl font-semibold mt-6">Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id} className="flex items-center space-x-4 mb-2">
            <img
              src={u.avatarUrl || "/default-avatar.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full border"
              loading="lazy"
            />
            <span>{u.displayName || u.email}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadAvatar(e, u.id)}
              className="ml-auto"
            />
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Courses</h2>
      <ul>
        {courses.map((c) => (
          <li key={c.id} className="flex justify-between mb-2">
            {c.title}
            <button
              onClick={() => deleteCourse(c.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
