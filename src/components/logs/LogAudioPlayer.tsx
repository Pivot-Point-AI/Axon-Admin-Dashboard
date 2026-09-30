"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { fetchAudioObjectUrl } from "@/lib/api/logs";

export default function LogAudioPlayer({ fileName }: { fileName: string }) {
  const { accessToken } = useAdminAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let objectUrl: string | null = null;
    fetchAudioObjectUrl(fileName, accessToken)
      .then((url) => {
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => setError("Failed to load audio."));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileName, accessToken]);

  if (error) return <p className="text-theme-xs text-error-500">{error}</p>;
  if (!src) {
    return (
      <p className="text-theme-xs text-gray-400 dark:text-gray-500">
        Loading audio…
      </p>
    );
  }
  return <audio className="w-full max-w-md" controls src={src} />;
}
