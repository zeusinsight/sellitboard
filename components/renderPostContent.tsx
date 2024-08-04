//@ts-nocheck
import React from "react";
import Image from "next/image";
import { is } from './../.next/static/chunks/[root of the server]__eea580._';

const TEXT_POST_SIZE = { width: 350, height: 40 };
const CARD_POST_SIZE = { width: 250, height: 0 };
const IMAGE_SIZE = { width: 500, height: 200 };
const IMAGE_POST_SIZE = { width: 175, height: 190 };

export const renderPostContent = (post, isAddingPost) => {
  switch (post.type) {
    case "TEXT":
      return (
        <div className="flex-1 text-center p-2 items-center justify-center">
          <p className="text-gray-800 line-clamp-2 text-sm text-center">
            {post.description.length > 40
              ? `${post.description.substring(0, 40)}...`
              : post.description}
          </p>
        </div>
      );
      case "CARD":
        return (
          <div className="pb-4">
            <div
              style={{
                width: '100%',
                height: '120px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                borderRadius: "8px 8px 0px 0px",
              }}
            >
              <Image
                src={isAddingPost ? post.previewImage : post.cardImage}
                alt="Card Image"
                width={IMAGE_SIZE.width}
                height={IMAGE_SIZE.height}
                objectFit="contain"
              />
            </div>
            <h3 className="text-gray-800 text-lg font-bold text-center mt-2">
              {post.cardTitle}
            </h3>
            <p className="text-gray-800 line-clamp-2 text-sm break-word text-center mx-7">
              {post.description.length > 100
                ? `${post.description.substring(0, 100)}...`
                : post.description}
            </p>
          </div>
        );
      case "IMAGE":
        return (
          <div className="">
            <Image
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "cover",
              }}
              src={isAddingPost ? post.previewImage : post.cardImage}
              alt="Post Image"
              width={IMAGE_SIZE.width}
              height={IMAGE_SIZE.height}
              className="rounded-lg"
            />
          </div>
        );
    default:
      return null;
  }
};