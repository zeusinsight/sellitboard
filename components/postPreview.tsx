//@ts-nocheck
import React from "react";
import { renderPostContent } from "@/components/renderPostContent";

const PostPreview = ({ isAddingPost, previewPosition, postSize, post }) => (
  <>
    {isAddingPost && (
      <div
        className="absolute rounded-lg cursor-pointer transition-all duration-200 text-center gap-4"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: post.type === "IMAGE" ? "0" : "8px",
          wordBreak: "break-word",
          left: previewPosition.x,
          top: previewPosition.y,
          width: post.type === "TEXT" ? "fit-content" : postSize.width,
          height: post.type === "TEXT" ? postSize.height : "0",
        }}
      >
        {renderPostContent(post)}
      </div>
    )}
</>
);

export default PostPreview;