import React, { useEffect, useState } from "react";

/** Minimal hash router provided by the RapidApps platform. */
function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, "");
  return raw || "/";
}

export function navigate(to: string): void {
  window.location.hash = to;
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

/** matchRoute("/employees/:id", "/employees/42") -> { id: "42" } */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split("/").filter(Boolean);
  const a = path.split("?")[0].split("/").filter(Boolean);
  if (p.length !== a.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}

export function Link(props: { to: string; className?: string; children?: React.ReactNode; title?: string }) {
  return (
    <a href={"#" + props.to} className={props.className} title={props.title}>
      {props.children}
    </a>
  );
}
