import Clarity from "@microsoft/clarity";

export function initClarity() {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();

  if (!projectId) {
    return;
  }

  Clarity.init(projectId);
}
