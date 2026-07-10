import { convertImageToThermal } from "../lib/imageProcessor";
import { useRef, useState } from "react";

export function useImage() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [resolution, setResolution] = useState("");
  const [thermalImage, setThermalImage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickImage = () => {
    inputRef.current?.click();
  };

  const onSelectImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (image) URL.revokeObjectURL(image);
    setThermalImage(null);

    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
    const url = URL.createObjectURL(file);

    const img = new Image();

    img.onload = () => {
        setResolution(`${img.width} × ${img.height}`);
    };

    img.src = url;

    setImage(url);

     // Reset the file input so the same file can be selected again
  if (inputRef.current) {
    inputRef.current.value = "";
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image);

    setImage(null);
    setThermalImage(null);
    setFileName("");
    setFileSize("");
    setResolution("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

    const convertToThermal = async () => {
        if (!image) return;

        const thermal = await convertImageToThermal(image);

        setThermalImage(thermal);
    };


  return {
    image,
    thermalImage,
    setThermalImage,
    fileName,
    fileSize,
    resolution,
    inputRef,
    pickImage,
    onSelectImage,
    removeImage,
    convertToThermal,
  };
}