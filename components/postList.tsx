// @ts-nocheck
"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { renderPostContent } from "@/components/renderPostContent";

import upVoteIcon from "../public/upvote.svg";
import shareIcon from "../public/share.svg";
import infoIcon from "../public/info.svg"; 

const TEXT_POST_SIZE = { width: 350, height: 40 };
const CARD_POST_SIZE = { width: 250, height: 0 };
const IMAGE_SIZE = { width: 500, height: 200 };
const IMAGE_POST_SIZE = { width: 175, height: 190 };
const PostList = ({ posts }) => {
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
          className="absolute rounded-lg cursor-pointer transition-all duration-200 hover:shadow-2xl hover:scale-105 text-center gap-4"
          key={post.id}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: post.type === "IMAGE" ? "0" : "8px",
            wordBreak: "break-word",
            left: post.x,
            top: post.y,
            width: post.type === "TEXT" ? "fit-content" : post.type === "CARD" ? CARD_POST_SIZE.width : post.type === "IMAGE" ? IMAGE_POST_SIZE.width : TEXT_POST_SIZE.width,
            height: post.type === "TEXT" ? TEXT_POST_SIZE.height : post.type === "CARD" ? "0" : post.type === "IMAGE" ? "0" : TEXT_POST_SIZE.height,
          }}
          onClick={() => handlePostClick(post)}
        >
          {renderPostContent(post)}
        </div>
      ))}

      {selectedPost && (
        <Dialog open={true} onOpenChange={handleCloseSelectedPost}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="flex justify-between mb-2">
                  <div className="bg-black text-white rounded-full px-2 py-0.5 text-sm font-bold flex items-center">
                    {selectedPost.type}
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

            {renderPostContent(selectedPost)}

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
                          style={{ transform: "rotate(180deg)" }}
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