//@ts-nocheck
"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  MinusIcon,
  MousePointerClick,
  HomeIcon,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import WelcomeMessage from "./../components/welcomeMessage";
import PostList from "@/components/postList";
import PostPreview from "@/components/postPreview";
import ControlButtons from "@/components/controlButtons";
import AddPostModal from "@/components/addPostModal";

const BOARD_SIZE = { width: 250000, height: 250000 };
const POST_SIZE = { width: 200, height: 100 };

const Whiteboard = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "" });
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [viewportTransform, setViewportTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState("default");

  const boardRef = useRef(null);

  const storePost = async (post) => {
    try {
      const response = await axios.post(
        "https://sellitboard.com:8443/api/new",
        post
      );
      console.log("post stored successfully:", response.data);
    } catch (error) {
      console.error("Error storing post:", error);
    }
  };

  async function fetchBoard() {
    try {
      const response = await axios.get(
        "https://sellitboard.com:8443/api/boards"
      );
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  }

  useEffect(() => {
    fetchBoard();

    // Connect to WebSocket
    const socket = new WebSocket("wss://sellitboard.com:8443");

    socket.onopen = () => {
      console.log("WebSocket connection established");
      
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      const data = JSON.parse(event.data);
      setPosts((prevPosts) => [...prevPosts, data]);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close(); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const INITIAL_VIEWPORT = {
        x: -25000 + window.innerWidth / 2,
        y: -25000 + window.innerHeight / 2,
        scale: 1,
      };
      setViewportTransform(INITIAL_VIEWPORT);
    }
  }, []);

  const resetViewport = useCallback(() => {
    if (typeof window !== "undefined") {
      const INITIAL_VIEWPORT = {
        x: -25000 + window.innerWidth / 2,
        y: -25000 + window.innerHeight / 2,
        scale: 1,
      };
      setViewportTransform(INITIAL_VIEWPORT);
    }
  }, []);

  const screenToBoardCoordinates = useCallback(
    (screenX, screenY) => {
      const boardRect = boardRef.current.getBoundingClientRect();
      return {
        x:
          (screenX - boardRect.left) / viewportTransform.scale -
          viewportTransform.x,
        y:
          (screenY - boardRect.top) / viewportTransform.scale -
          viewportTransform.y,
      };
    },
    [viewportTransform]
  );

  const startAddingPost = () => setIsModalOpen(true);

  const handleAddPost = useCallback(() => {
    if (newPost.title && newPost.description) {
      setIsAddingPost(true);
      setIsModalOpen(false);
      setCursor("default");
    }
  }, [newPost]);

  const handleBoardClick = useCallback(
    async (e) => {
      if (isAddingPost && e.button === 0) {
        const { x, y } = screenToBoardCoordinates(e.clientX, e.clientY);
        const postX = x - POST_SIZE.width / 2;
        const postY = y - POST_SIZE.height / 2;

        const isOverlapping = posts.some(
          (post) =>
            postX < post.x + POST_SIZE.width &&
            postX + POST_SIZE.width > post.x &&
            postY < post.y + POST_SIZE.height &&
            postY + POST_SIZE.height > post.y
        );

        if (!isOverlapping) {
          const post = {
            id: Date.now(),
            ...newPost,
            x: postX + viewportTransform.x,
            y: postY + viewportTransform.y,
          };
          setPosts((prevPosts) => [...prevPosts, post]);
          setIsAddingPost(false);
          storePost(post)
            .then(() => {
              setNewPost({ title: "", description: "" });

              setCursor("default");
            })
            .catch((error) => {
              console.error("Error storing post:", error);
            });
        } else {
          console.log("Cannot place post here due to overlap");
        }
      }
    },
    [
      isAddingPost,
      screenToBoardCoordinates,
      posts,
      viewportTransform,
      newPost,
    ]
  );

  const handleMouseDown = useCallback((e) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      setCursor("grab");
    }
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setViewportTransform((vt) => ({
          ...vt,
          x: vt.x + dx / (vt.scale * 2),
          y: vt.y + dy / (vt.scale * 2),
        }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }

      if (isAddingPost) {
        const { x, y } = screenToBoardCoordinates(e.clientX, e.clientY);
        setPreviewPosition({
          x: x - POST_SIZE.width / 2 + viewportTransform.x,
          y: y - POST_SIZE.height / 2 + viewportTransform.y,
        });
      }
    },
    [
      isPanning,
      isAddingPost,
      screenToBoardCoordinates,
      viewportTransform,
      lastMousePos,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (e.button === 1) {
        setIsPanning(false);
        setCursor(isAddingPost ? "crosshair" : "default");
      }
    },
    [isAddingPost]
  );

  const handleWheel = useCallback((e) => {
    e.preventDefault();

    setViewportTransform((vt) => {
      if (e.ctrlKey) {
        const scaleChange = -e.deltaY * 0.001;
        const newScale = Math.min(
          Math.max(vt.scale * (1 + scaleChange), 0.1),
          5
        );
        const scaleRatio = newScale / vt.scale;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        return {
          scale: newScale,
          x: vt.x - (mouseX - vt.x) * (scaleRatio - 1),
          y: vt.y - (mouseY - vt.y) * (scaleRatio - 1),
        };
      } else {
        return {
          ...vt,
          x: vt.x - e.deltaX / vt.scale,
          y: vt.y - e.deltaY / vt.scale,
        };
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const board = boardRef.current;
      board.addEventListener("wheel", handleWheel, { passive: false });
      return () => board.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (e.button === 1) {
        setIsPanning(false);
        setCursor("default");
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    const handleWindowEvents = (e) => {
      if (e.type === "mousedown") handleMouseDown(e);
      if (e.type === "mousemove") handleMouseMove(e);
      if (e.type === "mouseup") handleMouseUp(e);
      if (e.type === "wheel") handleWheel(e);
    };

    window.addEventListener("mousedown", handleWindowEvents);
    window.addEventListener("mousemove", handleWindowEvents);
    window.addEventListener("mouseup", handleWindowEvents);
    window.addEventListener("wheel", handleWindowEvents, { passive: false });

    return () => {
      window.removeEventListener("mousedown", handleWindowEvents);
      window.removeEventListener("mousemove", handleWindowEvents);
      window.removeEventListener("mouseup", handleWindowEvents);
      window.removeEventListener("wheel", handleWindowEvents);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <div
        className="absolute inset-0 bg-checkered opacity-10"
        style={{
          backgroundSize: `${20 * viewportTransform.scale}px ${
            20 * viewportTransform.scale
          }px`,
          backgroundPosition: `${
            viewportTransform.x * viewportTransform.scale
          }px ${viewportTransform.y * viewportTransform.scale}px`,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: `${BOARD_SIZE.width}px`,
          height: `${BOARD_SIZE.height}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: "0 0",
          border: "20px solid",
          borderImage:
            "repeating-conic-gradient(#808080 0 90deg, #ffffff 0 180deg) 40",
          borderImageSlice: "40",
        }}
      />
      <div
        ref={boardRef}
        className="absolute"
        style={{
          width: `${BOARD_SIZE.width}px`,
          height: `${BOARD_SIZE.height}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: "0 0",
          cursor: cursor,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={(e) => {
          handleMouseUp(e);
          handleBoardClick(e);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <WelcomeMessage />
        <PostList posts={posts} postSize={POST_SIZE} />
        <PostPreview
          isAddingPost={isAddingPost}
          previewPosition={previewPosition}
          postSize={POST_SIZE}
        />
      </div>
      <ControlButtons
        onZoomIn={() =>
          setViewportTransform((vt) => ({
            ...vt,
            scale: Math.min(vt.scale + 0.1, 5),
          }))
        }
        onZoomOut={() =>
          setViewportTransform((vt) => ({
            ...vt,
            scale: Math.max(vt.scale - 0.1, 0.1),
          }))
        }
        onReset={resetViewport}
        onAddPost={startAddingPost}
        isAddingPost={isAddingPost}
      />
      <AddPostModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        newPost={newPost}
        setNewPost={setNewPost}
        onAddPost={handleAddPost}
      />
    </div>
  );
};

export default Whiteboard;
