// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import upVoteIcon from "../public/upvote.svg";
import shareIcon from "../public/share.svg";
import infoIcon from "../public/info.svg"; // Import the info icon
import Image from "next/image";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Info } from "lucide-react";

const PostList = ({ posts, postSize }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [votes, setVotes] = useState({ upvotes: 0 });

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setVotes({ upvotes: post.upvotes || 0 }); // Initialize votes
  };

  const handleCloseSelectedPost = () => {
    setSelectedPost(null);
  };

  const handleVote = (type) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [type]: prevVotes[type] + 1,
    }));
  };

  return (
    <>
      {posts.map((post) => (
        <div
          className="absolute p-2 px-3 bg-white shadow-lg rounded-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105"
          key={post.id}
          style={{
            left: post.x,
            top: post.y,
            width: postSize.width,
            height: postSize.height,
          }}
          onClick={() => handlePostClick(post)}
        >
          <div className="flex justify-between mb-2">
            <div className="bg-black text-white rounded-full px-2 py-0.5 text-sm font-bold">
              TEXT
            </div>
            <div className="text-gray-500 text-sm">02:35:20</div>
          </div>

          <div className="flex-1">
            <p className="text-gray-800 line-clamp-2 text-sm">
              {post.description.length > 40
                ? `${post.description.substring(0, 40)}...`
                : post.description}
            </p>
          </div>
        </div>
      ))}

      {selectedPost && (
        <Dialog open={true} onOpenChange={handleCloseSelectedPost}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="flex justify-between mb-2">
                  <div className="bg-black text-white rounded-full px-2 py-0.5 text-sm font-bold flex items-center">
                    TEXT
                  </div>

                  <div className="flex space-x-2 items-center text-sm text-gray-500 font-bold">
                    <div className="text-gray-500 text-sm">02:35:20</div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <button>
                            <Info className="text-gray-500" size={24} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Made by @{selectedPost.author}</p>
                          <p>14 Jul, 2024 16:00:22</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1">
              <p className="text-gray-800 text-md">
                {selectedPost.description}
              </p>
            </div>

            <div className="flex justify-between mb-2">
              <div className="flex space-x-2 items-center text-sm text-gray-500 font-bold mr-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <button onClick={() => handleVote("upvotes")}>
                        <Image
                          src={upVoteIcon}
                          alt="Upvote"
                          width={24}
                          height={24}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upvote this post</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {votes.upvotes}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <button onClick={() => handleVote("downvotes")}>
                        <Image
                          src={upVoteIcon}
                          alt="Downvote"
                          width={24}
                          height={24}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Downvote this post</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <button>
                      <Image
                        src={shareIcon}
                        alt="Share"
                        width={24}
                        height={24}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this post</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PostList;
