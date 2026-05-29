import Image from "next/image";

const features = [
  {
    image: "/images/1.png",
    title1: "CLEAN",
    title2: "INGREDIENTS",
  },
  {
    image: "/images/2.png",
    title1: "FAST",
    title2: "RESULTS",
  },
  {
    image: "/images/3.png",
    title1: "TOXINS",
    title2: "FREE",
  },
  {
    image: "/images/4.png",
    title1: "CRUELTY",
    title2: "FREE",
  },
];

export function ProductFeatures() {
  return (
    <div className="w-full mt-6 mb-2">
      <div className="grid grid-cols-4 gap-2">
        {features.map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 relative">
              <Image
                src={feature.image}
                alt={`${feature.title1} ${feature.title2}`}
                fill
                sizes="120px"
                className="object-contain mix-blend-multiply brightness-110 contrast-125"
              />
            </div>
            <p className="text-[#A58B65] font-serif tracking-widest text-[10px] sm:text-xs leading-tight font-medium">
              {feature.title1}
              <br />
              {feature.title2}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
