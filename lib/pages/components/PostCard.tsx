import { useState } from "react";

interface Post {
  id: string;
  text: string;
  images?: string[];
  sender: string;
  avatar: string;
}

export function PostCard({ post }: { post: Post }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const nextImage = () => {
    setCurrentImageIndex((i) => (i + 1) % (post.images?.length || 1));
  };
  const prevImage = () => {
    setCurrentImageIndex((i) =>
      (i - 1 + (post.images?.length || 1)) % (post.images?.length || 1)
    );
  };

  return (
    <>
      <div className="border p-4 rounded shadow max-w-md">
        <div className="flex items-center space-x-2 mb-2">
          <img src={post.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          <strong>{post.sender}</strong>
        </div>
        <p className="mb-2">{post.text}</p>
        <div className="flex space-x-2 flex-wrap">
          {post.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`post-img-${idx}`}
              className="w-20 h-20 object-cover rounded cursor-pointer border"
              onClick={() => openModal(idx)}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {modalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[80vh]"
          >
            <img
              src={post.images![currentImageIndex]}
              alt={`modal-img-${currentImageIndex}`}
              className="max-w-full max-h-[80vh] rounded"
            />
            {post.images && post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-2 text-white text-3xl font-bold select-none"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-2 text-white text-3xl font-bold select-none"
                >
                  ›
                </button>
              </>
            )}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-3xl font-bold select-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
