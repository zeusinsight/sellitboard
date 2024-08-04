//@ts-nocheck
"use client";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import _ from "lodash";

const BOARD_SIZE = { width: 250000, height: 250000 };


const Whiteboard = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ cardTitle: "", description: "", type: "TEXT", limitTimestamp: 0 });
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

  const POST_SIZES = useMemo(() => ({
    TEXT: { width: 350, height: 40 },
    CARD: { width: 250, height: 0 },
    IMAGE: { width: 175, height: 190 },
  }), []);

  const boardRef = useRef(null);

  useEffect(() => {
    axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:8443/api' : 'https://sellitboard.com:8443/api';
  }, []);

  const storePost = useCallback(async (post) => {
    try {
      const response = await axios.post("/new", post);
      console.log("post stored successfully:", response.data);
    } catch (error) {
      console.error("Error storing post:", error);
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const response = await axios.get("/boards");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  }, []);

  useEffect(() => {
    fetchBoard();

    const socket = new WebSocket("wss://sellitboard.com:8443");

    socket.onopen = () => console.log("WebSocket connection established");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPosts((prevPosts) => {
        if (!prevPosts.some((post) => post.id === data.id)) {
          return [...prevPosts, data];
        }
        return prevPosts;
      });
    };
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket connection closed");

    return () => socket.close();
  }, [fetchBoard]);

  const initializeViewport = useCallback(() => {
    if (typeof window !== "undefined") {
      return {
        x: -25000 + window.innerWidth / 2,
        y: -25000 + window.innerHeight / 2,
        scale: 1,
      };
    }
    return { x: 0, y: 0, scale: 1 };
  }, []);

  useEffect(() => {
    setViewportTransform(initializeViewport());
  }, [initializeViewport]);

  const resetViewport = useCallback(() => {
    setViewportTransform(initializeViewport());
  }, [initializeViewport]);

  const screenToBoardCoordinates = useCallback(
    (screenX, screenY) => {
      const boardRect = boardRef.current.getBoundingClientRect();
      return {
        x: (screenX - boardRect.left) / viewportTransform.scale - viewportTransform.x,
        y: (screenY - boardRect.top) / viewportTransform.scale - viewportTransform.y,
      };
    },
    [viewportTransform]
  );

  const startAddingPost = useCallback(() => setIsModalOpen(true), []);

  const handleAddPost = useCallback(() => {
    if ((newPost.type === "TEXT" && newPost.description) ||
        (newPost.type === "CARD" && newPost.cardTitle && newPost.description) ||
        (newPost.type === "IMAGE" && newPost.cardImage)) {
      setIsAddingPost(true);
      setIsModalOpen(false);
      setCursor("pointer");
    }
  }, [newPost]);

  const handleBoardClick = useCallback(
    async (e) => {
      if (isAddingPost && e.button === 0) {
        const { x, y } = screenToBoardCoordinates(e.clientX, e.clientY);
        const postSize = POST_SIZES[newPost.type];
        const postX = x - postSize.width / 2;
        const postY = y - postSize.height / 2;

        const isOverlapping = posts.some(
          (post) =>
            postX < post.x + postSize.width &&
            postX + postSize.width > post.x &&
            postY < post.y + postSize.height &&
            postY + postSize.height > post.y
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

          try {
            await storePost(post);
            setNewPost({ cardTitle: "", description: "", type: "TEXT", cardImage: null });
            setCursor("default");
          } catch (error) {
            console.error("Error storing post:", error);
          }
        } else {
          console.log("Cannot place post here due to overlap");
        }
      }
    },
    [isAddingPost, screenToBoardCoordinates, posts, viewportTransform, newPost, storePost]
  );

  const handleMouseDown = useCallback((e) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      setCursor("grabbing");
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
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
      const postSize = POST_SIZES[newPost.type];
      const previewX = x - postSize.width / 2 + viewportTransform.x;
      const previewY = y - postSize.height / 2 + viewportTransform.y;
      setPreviewPosition({ x: previewX, y: previewY });
    }
  }, [isPanning, isAddingPost, screenToBoardCoordinates, lastMousePos, viewportTransform, newPost.type]);

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
        const newScale = Math.min(Math.max(vt.scale * (1 + scaleChange), 0.1), 5);
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
    const board = boardRef.current;
    board.addEventListener("wheel", handleWheel, { passive: false });
    return () => board.removeEventListener("wheel", handleWheel);
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
      switch (e.type) {
        case "mousedown":
          handleMouseDown(e);
          break;
        case "mousemove":
          handleMouseMove(e);
          break;
        case "mouseup":
          handleMouseUp(e);
          break;
        case "wheel":
          handleWheel(e);
          break;
      }
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

  const boardStyle = useMemo(() => ({
    width: `${BOARD_SIZE.width}px`,
    height: `${BOARD_SIZE.height}px`,
    transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
    transformOrigin: "0 0",
    cursor: cursor,
  }), [viewportTransform, cursor]);

  const checkeredStyle = useMemo(() => ({
    backgroundSize: `${20 * viewportTransform.scale}px ${20 * viewportTransform.scale}px`,
    backgroundPosition: `${viewportTransform.x * viewportTransform.scale}px ${viewportTransform.y * viewportTransform.scale}px`,
  }), [viewportTransform]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <div
        className="absolute inset-0 bg-checkered opacity-10"
        style={checkeredStyle}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: `${BOARD_SIZE.width}px`,
          height: `${BOARD_SIZE.height}px`,
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: "0 0",
          border: "20px solid",
          borderImage: "repeating-conic-gradient(#808080 0 90deg, #ffffff 0 180deg) 40",
          borderImageSlice: "40",
        }}
      />
      <div
        ref={boardRef}
        className="absolute"
        style={boardStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={(e) => {
          handleMouseUp(e);
          handleBoardClick(e);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <WelcomeMessage />
        <PostList posts={posts} />
        <PostPreview
          isAddingPost={isAddingPost}
          previewPosition={previewPosition}
          postSize={POST_SIZES[newPost.type]}
          post={newPost}
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