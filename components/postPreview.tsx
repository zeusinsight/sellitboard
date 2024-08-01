//@ts-nocheck

const PostPreview = ({ isAddingPost, previewPosition, postSize }) => (
    <>
      {isAddingPost && (
        <div
          className="absolute border-2 border-blue-500 rounded-lg pointer-events-none"
          style={{
            left: previewPosition.x,
            top: previewPosition.y,
            width: postSize.width,
            height: postSize.height,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
          }}
        />
      )}
    </>
  );

  export default PostPreview