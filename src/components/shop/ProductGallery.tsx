import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const missing = !current || current.endsWith("image-unavailable.webp");

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <img src={current} alt={missing ? "" : name} width="900" height="675" />
        {missing ? <p>Image unavailable</p> : null}
      </div>
      {images.length > 1 ? (
        <ul className="product-thumbs">
          {images.map((image, imageIndex) => (
            <li key={`${image}-${imageIndex}`}>
              <button
                type="button"
                aria-label={`Show photo ${imageIndex + 1} of ${name}`}
                aria-pressed={imageIndex === index}
                onClick={() => setIndex(imageIndex)}
              >
                <img src={image} alt="" width="120" height="90" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
