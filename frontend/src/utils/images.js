import fallbackImage from "../assets/images/12.webp";
import image2 from "../assets/images/2.webp";
import image3 from "../assets/images/3.webp";
import image4 from "../assets/images/4.webp";
import image5 from "../assets/images/5.webp";
import image6 from "../assets/images/6.webp";
import image7 from "../assets/images/7.webp";
import image8 from "../assets/images/8.webp";
import image12 from "../assets/images/12.webp";
import imageH1 from "../assets/images/h1.webp";

const API_ORIGIN = "http://localhost:5000";

const localImages = {
  "2.webp": image2,
  "3.webp": image3,
  "4.webp": image4,
  "5.webp": image5,
  "6.webp": image6,
  "7.webp": image7,
  "8.webp": image8,
  "12.webp": image12,
  "h1.webp": imageH1,
};

export function getImageUrl(image) {
  if (!image || image === "d") return fallbackImage;
  if (typeof image !== "string") return fallbackImage;
  if (image.startsWith("http") || image.startsWith("data:") || image.startsWith("blob:")) return image;
  if (localImages[image]) return localImages[image];
  if (image.startsWith("/uploads/")) return `${API_ORIGIN}${image}`;
  if (image.startsWith("/")) return image;
  return localImages[image] || `${API_ORIGIN}/uploads/${image}`;
}

export { fallbackImage };
