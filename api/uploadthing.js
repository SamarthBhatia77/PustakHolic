import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  // Existing profile image route
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete((data) => {
    console.log("Profile upload complete:", data.file.ufsUrl);
    return { uploadedUrl: data.file.ufsUrl };
  }),

  // 🔥 NEW: Book image route
  bookImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete((data) => {
    console.log("Book image upload complete:", data.file.ufsUrl);
    return { uploadedUrl: data.file.ufsUrl };
  }),
};