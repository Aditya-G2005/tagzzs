"use client";

import Image from "next/image";

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
}) => {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      {items.map((item, idx) => (
        <div className="group relative -mr-2" key={idx}>
          <Image
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="relative !m-0 h-8 w-8 rounded-full border-2 border-white object-cover object-top !p-0"
          />
        </div>
      ))}
    </div>
  );
};
