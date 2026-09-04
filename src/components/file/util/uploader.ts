export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const validateFile = (
  file: File,
  maxSizeBytes: number,
  accept: string,
): string | null => {
  if (maxSizeBytes && file.size > maxSizeBytes) {
    return `"${file.name}" exceeds the maximum limit of ${formatFileSize(maxSizeBytes)}.`;
  }
  if (accept) {
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }
      if (type.endsWith("/*")) {
        const mainType = type.split("/")[0];
        return fileType.startsWith(`${mainType}/`);
      }
      return fileType === type;
    });

    if (!isAccepted) {
      return `"${file.name}" is not a supported file type.`;
    }
  }
  return null;
};

export function getFriendlyAcceptDescriptions(acceptString: string) {
  if (!acceptString) return ["All file types"];

  const tokens = acceptString
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const labels = tokens.map((token) => {
    if (token === "image/*") {
      return "AVIF, WebP, PNG, JPEG / JPG, SVG, APNG, GIF";
    }
    if (token === "video/*") {
      return "MP4, WebM, and Ogg";
    }
    if (token === "audio/*") {
      return "MP3, WAV, and OGG";
    }

    const mimeMap: Record<string, string> = {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
      "application/msword": "DOC",
      "application/vnd.ms-word.document.macroEnabled.12": "DOCM",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template":
        "DOTX",
      "application/vnd.ms-word.template.macroEnabled.12": "DOTM",

      "application/rtf": "RTF",
      "text/rtf": "RTF",
      "text/plain": "TXT",
      "application/pdf": "PDF",
      "application/vnd.oasis.opendocument.text": "ODT",
      "text/html": "HTML",
      "application/xml": "XML",
      "text/xml": "XML",
      "message/rfc822": "MHT / MHTML",
      "application/x-mimearchive": "MHT / MHTML",

      "text/csv": "CSV",
      "application/zip": "ZIP",
      "application/x-zip-compressed": "ZIP",
      "application/json": "JSON",
    };

    if (mimeMap[token.toLowerCase()]) {
      return mimeMap[token.toLowerCase()];
    }

    if (token.endsWith("/*")) {
      const category = token.split("/")[0];
      return `All ${category} files`;
    }

    if (token.startsWith(".")) {
      return `${token.slice(1).toUpperCase()} files`;
    }

    return token;
  });

  return [...new Set(labels)];
}

// Helper to safely revoke Object URLs
export const revokeUrl = (url: string | null) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};
