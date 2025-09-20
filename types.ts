
export interface ImageFile {
  name: string;
  type: string;
  base64: string;
}

export interface EditResult {
    image?: {
        base64: string;
        mimeType: string;
    },
    text?: string;
}
