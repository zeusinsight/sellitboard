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
import ProjectList from "@/components/projectList";
import ProjectPreview from "@/components/projectPreview";
import ControlButtons from "@/components/controlButtons";
import AddProjectModal from "@/components/addProjectModal";

const BOARD_SIZE = { width: 250000, height: 250000 };
const PROJECT_SIZE = { width: 200, height: 100 };
const INITIAL_VIEWPORT = {
  x: -25000 + window.innerWidth / 2,
  y: -25000 + window.innerHeight / 2,
  scale: 1,
};

const Whiteboard = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [viewportTransform, setViewportTransform] = useState(INITIAL_VIEWPORT);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState("default");

  const boardRef = useRef(null);

  const storeProject = async (project) => {
    try {

      const response = await axios.post("https://sellitboard:8443/api/new", project);
      console.log("Project stored successfully:", response.data);
    } catch (error) {
      console.error("Error storing project:", error);
    }
  };

  async function fetchBoard() {
    try {
      const response = await axios.get("https://sellitboard:8443/api/boards");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  }

  useEffect(() => {
    fetchBoard();
  }, []);

  const resetViewport = useCallback(() => {
    setViewportTransform(INITIAL_VIEWPORT);
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

  const startAddingProject = () => setIsModalOpen(true);

  const handleAddProject = useCallback(() => {
    if (newProject.title && newProject.description) {
      setIsAddingProject(true);
      setIsModalOpen(false);
      setCursor("default");
    }
  }, [newProject]);

  const handleBoardClick = useCallback(
    async (e) => {
      if (isAddingProject && e.button === 0) {
        const { x, y } = screenToBoardCoordinates(e.clientX, e.clientY);
        const projectX = x - PROJECT_SIZE.width / 2;
        const projectY = y - PROJECT_SIZE.height / 2;

        const isOverlapping = projects.some(
          (project) =>
            projectX < project.x + PROJECT_SIZE.width &&
            projectX + PROJECT_SIZE.width > project.x &&
            projectY < project.y + PROJECT_SIZE.height &&
            projectY + PROJECT_SIZE.height > project.y
        );

        if (!isOverlapping) {
          const project = {
            id: Date.now(),
            ...newProject,
            x: projectX + viewportTransform.x,
            y: projectY + viewportTransform.y,
          };
          setProjects((prevProjects) => [...prevProjects, project]);
          storeProject(project).then(() => {
            setNewProject({ title: "", description: "" });
            setIsAddingProject(false);
            setCursor("default");
          }).catch((error) => {
            console.error("Error storing project:", error);
          });
        } else {
          console.log("Cannot place project here due to overlap");
        }
      }
    },
    [
      isAddingProject,
      screenToBoardCoordinates,
      projects,
      viewportTransform,
      newProject,
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

      if (isAddingProject) {
        const { x, y } = screenToBoardCoordinates(e.clientX, e.clientY);
        setPreviewPosition({
          x: x - PROJECT_SIZE.width / 2 + viewportTransform.x,
          y: y - PROJECT_SIZE.height / 2 + viewportTransform.y,
        });
      }
    },
    [
      isPanning,
      isAddingProject,
      screenToBoardCoordinates,
      viewportTransform,
      lastMousePos,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (e.button === 1) {
        setIsPanning(false);
        setCursor(isAddingProject ? "crosshair" : "default");
      }
    },
    [isAddingProject]
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
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
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
        <ProjectList projects={projects} projectSize={PROJECT_SIZE} />
        <ProjectPreview
          isAddingProject={isAddingProject}
          previewPosition={previewPosition}
          projectSize={PROJECT_SIZE}
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
        onAddProject={startAddingProject}
        isAddingProject={isAddingProject}
      />
      <AddProjectModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        newProject={newProject}
        setNewProject={setNewProject}
        onAddProject={handleAddProject}
      />
    </div>
  );
};

export default Whiteboard;
