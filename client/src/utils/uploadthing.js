import { generateUploadButton, generateReactHelpers } from "@uploadthing/react";

// Points to our Express backend (proxied via Vite in dev)
export const UploadButton = generateUploadButton({
  url: "http://localhost:5000/api/uploadthing",
});

export const { useUploadThing } = generateReactHelpers({
  url: "http://localhost:5000/api/uploadthing",
});