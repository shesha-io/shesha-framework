import React, { useState } from "react";

interface IProps {
  url: string;
  image: string;
}

export const Banner: React.FC<IProps> = ({ url, image }) => {
  const [showImage, setShowImage] = useState(true);

  const handleClick = () => {
    setShowImage(false);
  };

  return (
    <div>
      {showImage ? (
        <img
          src={image}
          alt="Clickable Image"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
          width={800}
        />
      ) : (
        <iframe
          title="Embedded Iframe"
          src={url}
          width={800}
          height="500"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
};

export default Banner;
