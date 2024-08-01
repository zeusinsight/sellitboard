//@ts-nocheck

const PostList = ({ posts, postSize }) => (
  <>
    {posts.map((post) => (
      <div
        key={post.id}
        className="absolute p-4 bg-white shadow-lg rounded-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{
          left: post.x,
          top: post.y,
          width: postSize.width,
          height: postSize.height,
        }}
      >
        <h3 className="text-lg text-gray-800 font-bold mb-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm">{post.description}</p>
      </div>
    ))}
  </>
);

export default PostList;
