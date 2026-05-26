import Image, { type ImageProps } from "next/image";

type LandingImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
};

/** next/image wrapper — preserves parent sizing via className (object-cover, w-full h-full). */
export function LandingImage({ className, ...props }: LandingImageProps) {
  return <Image className={className} {...props} />;
}
