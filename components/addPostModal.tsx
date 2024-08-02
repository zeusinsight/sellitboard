//@ts-nocheck
import React, { useState, useEffect } from "react";
import {
  TextIcon,
  ImageIcon,
  CreditCardIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const PostTypeCard = ({ icon: Icon, title, selected, onClick }) => (
  <Card
    className={`cursor-pointer transition-all ${
      selected
        ? "border-primary shadow-lg scale-105"
        : "border-gray-200 hover:border-gray-300 hover:shadow"
    }`}
    onClick={onClick}
  >
    <CardContent className="flex flex-col items-center justify-center p-6 h-full">
      <Icon
        className={`w-12 h-12 mb-2 ${
          selected ? "text-primary" : "text-gray-500"
        }`}
      />
      <h3
        className={`font-semibold ${
          selected ? "text-primary" : "text-gray-700"
        }`}
      >
        {title}
      </h3>
    </CardContent>
  </Card>
);

const ImageUploadPreview = ({ image, onImageChange }) => (
  <div className="mt-4 space-y-4">
    <Label htmlFor="cardImage" className="text-lg font-medium">
      Card Image
    </Label>
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="cardImage"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Card preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
        <input
          id="cardImage"
          type="file"
          className="hidden"
          onChange={onImageChange}
          accept="image/*"
        />
      </label>
    </div>
  </div>
);

const AddPostModal = ({
  isOpen,
  onOpenChange,
  newPost,
  setNewPost,
  onAddPost,
}) => {
  const [selectedType, setSelectedType] = useState("TEXT");
  const [cardTitle, setCardTitle] = useState("");
  const [cardImage, setCardImage] = useState(null);

  useEffect(() => {
    if (selectedType === "CARD") {
      setNewPost((prev) => ({ ...prev, cardTitle: "", cardImage: null }));
    }
  }, [selectedType]);

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setNewPost({ ...newPost, type: value });
  };

  const handleCardTitleChange = (e) => {
    setCardTitle(e.target.value);
    setNewPost((prev) => ({ ...prev, cardTitle: e.target.value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardImage(file);
        setNewPost((prev) => ({ ...prev, cardImage: reader.result })); // Store Base64 string
      };
      reader.readAsDataURL(file); // Read file as Base64
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[700px] overflow-y-auto scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create New Post
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-medium">Choose Post Type</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <PostTypeCard
                icon={TextIcon}
                title="Text"
                selected={selectedType === "TEXT"}
                onClick={() => handleTypeChange("TEXT")}
              />
              <PostTypeCard
                icon={CreditCardIcon}
                title="Card"
                selected={selectedType === "CARD"}
                onClick={() => handleTypeChange("CARD")}
              />
              <PostTypeCard
                icon={ImageIcon}
                title="Image"
                selected={selectedType === "IMAGE"}
                onClick={() => handleTypeChange("IMAGE")}
              />
            </div>
          </div>

          {selectedType === "CARD" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardTitle" className="text-lg font-medium">
                  Card Title
                </Label>
                <Input
                  id="cardTitle"
                  placeholder="Enter card title..."
                  value={cardTitle}
                  onChange={handleCardTitleChange}
                  className="w-full"
                />
              </div>
              <ImageUploadPreview
                image={cardImage}
                onImageChange={handleImageChange}
              />
            </>
          )}

          {selectedType === "IMAGE" && (
            <ImageUploadPreview image={cardImage} onImageChange={handleImageChange} />
          )}
          {selectedType === "TEXT" || selectedType === "CARD" ? (
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-medium">
              {selectedType === "CARD"
                ? "Card Description"
                : "What's on your mind?"}
            </Label>
            <Textarea
              id="description"
              placeholder={
                selectedType === "CARD"
                  ? "Enter card description..."
                  : "Share your thoughts..."
              }
              value={newPost.description}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  description: e.target.value,
                  timestamp: Date.now(),
                })
              }
              className="min-h-[100px]"
              maxLength={selectedType === "TEXT" ? 200 : undefined}
            />
            <p className="text-sm text-gray-500">
              {selectedType === "TEXT" ? "Max 200 characters" : ""}
            </p>
          </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={onAddPost} className="w-full">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </DialogFooter>
      </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default AddPostModal;