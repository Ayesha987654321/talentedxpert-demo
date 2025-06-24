"use client";
import { getColorFromInitial, getFirstInitials } from "@/services/utils/util";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";

const ImageFallback = ({
  src,
  fallbackSrc,
  blurDataURL,
  alt,
  userName,
  width,
  height,
  ...rest
}: any) => {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(src);
  const [isImageLoaded, setIsImageLoaded] = useState(true);

  useEffect(() => {
    // Only set to empty string if src is a string and includes 'file:'
    if (typeof src === "string" && src.includes("file:")) {
      setImgSrc("");
    } else {
      setImgSrc(src);
    }
    setIsImageLoaded(true);
  }, [src]);

  const handleLoadingComplete = (result: HTMLImageElement) => {
    if (result.naturalWidth === 0) {
      setImgSrc(fallbackSrc);
      setIsImageLoaded(false);
    }
  };

  const handleError = () => {
    setImgSrc(fallbackSrc);
    setIsImageLoaded(false);
  };

  const renderInitials = () => {
    if (!userName) return null;
    const initials = getFirstInitials(userName);
    const randomColor = initials && getColorFromInitial(initials.charAt(0));

    return (
      <div style={{ border: "none" }} className="mb-2" {...rest}>
        <div
          className="mx-auto"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: randomColor,
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: "50%",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {initials}
        </div>
      </div>
    );
  };

  // Simplify rendering logic: Always render <Image> if imgSrc exists, otherwise render initials (if applicable)
  return (
    <>
      {userName && !imgSrc ? (
        renderInitials()
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          onLoadingComplete={handleLoadingComplete}
          onError={handleError}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          {...rest}
        />
      )}
    </>
  );
};

export default ImageFallback;
