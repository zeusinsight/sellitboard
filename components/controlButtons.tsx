// @ts-nocheck
import {
    PlusIcon,
    MinusIcon,
    MousePointerClick,
    HomeIcon,
    Layers,
    Sparkles,
  } from "lucide-react";
const ControlButtons = ({
    onZoomIn,
    onZoomOut,
    onReset,
    onAddProject,
    isAddingProject,
  }) => (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
      <button
        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        onClick={onZoomIn}
      >
        <PlusIcon size={20} />
      </button>
      <button
        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        onClick={onZoomOut}
      >
        <MinusIcon size={20} />
      </button>
      <button
        className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200"
        onClick={onReset}
        title="Reset to origin"
      >
        <HomeIcon size={20} />
      </button>
      <button
        className={`px-4 py-3 ${
          isAddingProject
            ? "bg-yellow-500 hover:bg-yellow-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center`}
        onClick={onAddProject}
      >
        {isAddingProject ? (
          <>
            <MousePointerClick size={18} className="mr-2" />
            <span className="text-sm font-medium">Place</span>
          </>
        ) : (
          <span className="text-sm font-medium">Add Project</span>
        )}
      </button>
    </div>
  );

export default ControlButtons