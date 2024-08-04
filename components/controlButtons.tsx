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
    onAddPost,
    isAddingPost,
  }) => (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 flex items-center">
      <button
        className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200"
        onClick={onZoomIn}
      >
        <PlusIcon size={20} />
      </button>
      <button
        className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200"
        onClick={onZoomOut}
      >
        <MinusIcon size={20} />
      </button>
      <button
        className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200"
        onClick={onReset}
        title="Reset to origin"
      >
        <HomeIcon size={20} />
      </button>
      <button
        className={`px-4 py-3 ${
          isAddingPost
            ? "bg-yellow-600 hover:bg-yellow-700"
            : "bg-green-600 hover:bg-green-700"
        } text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center`}
        onClick={onAddPost}
      >
        {isAddingPost ? (
          <>
            <MousePointerClick size={18} className="mr-2" />
            <span className="text-sm font-medium">Place</span>
          </>
        ) : (
          <span className="text-sm font-medium">Add Post</span>
        )}
      </button>
    </div>
  );

export default ControlButtons