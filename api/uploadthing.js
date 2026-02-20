import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete((data) => {
    console.log("Upload complete:", data.file.ufsUrl);
  }),
};