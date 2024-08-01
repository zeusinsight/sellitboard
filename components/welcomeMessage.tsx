import {
    PlusIcon,
    MinusIcon,
    MousePointerClick,
    HomeIcon,
    Layers,
    Sparkles,
  } from "lucide-react";

const WelcomeMessage = () => (
    <div
      className="absolute p-6 bg-white bg-opacity-90 rounded-lg shadow-xl"
      style={{
        left: "25000px",
        top: "25000px",
        transform: "translate(-50%, -50%)",
      }}
    >
      <h1 className="text-4xl font-bold text-blue-600 mb-2 flex items-center">
        <Layers className="mr-3 text-blue-500" size={36} />
        Welcome to SellitBoard
      </h1>
      <p className="text-xl text-gray-700 flex items-center">
        <Sparkles className="mr-2 text-yellow-500" size={24} />
        Create and organize your projects with ease!
      </p>
    </div>
  );

export default WelcomeMessage;