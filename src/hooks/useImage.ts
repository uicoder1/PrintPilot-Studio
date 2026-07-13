  import { convertImageToThermal } from "../lib/imageProcessor";
  import type { ThermalMode } from "../lib/imageProcessor";
  import { useRef, useState } from "react";


  export function useImage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [workingImage, setWorkingImage] = useState<string | null>(null);

    const [isThermal, setIsThermal] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState("");
    const [resolution, setResolution] = useState("");
    const [imgWidth, setImgWidth] = useState(0);
    const [imgHeight, setImgHeight] = useState(0);
    
    const [rotateDeg, setRotateDeg] = useState(0);
    const [qualityMode, setQualityModeState] = useState<ThermalMode>("hd");
    const [copies, setCopies] = useState(1);
    
    const [converting, setConverting] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const pickImage = () => {
      inputRef.current?.click();
    };

    const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (workingImage) URL.revokeObjectURL(workingImage);  
      setIsThermal(false);
      setRotateDeg(0);
      setCopies(1);

      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
      const url = URL.createObjectURL(file);

      const img = new Image();

      img.onload = () => {
        setResolution(`${img.width} × ${img.height}`);
        setImgWidth(img.width);
        setImgHeight(img.height);
      };

      img.src = url;

      setOriginalImage(url);
      setWorkingImage(url);
      setIsThermal(false);

      // Reset the file input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const removeImage = () => {
  if (workingImage) URL.revokeObjectURL(workingImage);
      setOriginalImage(null);
      setWorkingImage(null);
      setIsThermal(false);
      setFileName("");
      setFileSize("");
      setResolution("");
      setImgWidth(0);
      setImgHeight(0);
      setRotateDeg(0);
      setCopies(1);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    // Rotating or changing quality mode invalidates the last conversion, so
    // the user re-runs "Convert to Thermal" and always prints what they see.
      const rotateImage = () => {
    if (!workingImage) return;

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = img.height;
      canvas.height = img.width;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);

      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2
      );

      setWorkingImage(canvas.toDataURL("image/png"));
      setRotateDeg((prev) => (prev + 90) % 360);
    };

    img.src = workingImage;
  };

    const setQualityMode = (mode: ThermalMode) => {
      setQualityModeState(mode);
    };

    const convertToThermal = async () => {
    if (!workingImage || converting) return;

    try {
      setConverting(true);

      const thermal = await convertImageToThermal(originalImage!,{
        rotateDeg,
        mode: qualityMode,
      });

      setWorkingImage(thermal);
      setIsThermal(true);
    } finally {
      setConverting(false);
    }
  };

    return {
      originalImage,
      workingImage,
      isThermal,
      
      fileName,
      fileSize,
      resolution,
      imgWidth,
      imgHeight,
      rotateDeg,
      rotateImage,
      qualityMode,
      setQualityMode,
      copies,
      setCopies,
      converting,
      inputRef,
      pickImage,
      onSelectImage,
      removeImage,
      convertToThermal,
    
    };
  }
