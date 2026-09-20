import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { setupAuthClient } from "#/modules/auth";
import { setupFileStorageClient } from "#/modules/file-storage";
import { getRouter } from "./router";
import "./styles.css";

setupAuthClient();
setupFileStorageClient();

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
