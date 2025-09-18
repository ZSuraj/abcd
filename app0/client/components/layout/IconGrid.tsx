"use client";

import React from "react";
import {
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
  DollarSign,
  Wallet,
  Coins,
  WalletCards,
  HandCoins,
  CircleDollarSign,
  ReceiptCent,
  ChartPie,
  ChartBar,
  ChartLine,
  FileChartPie,
  BadgeDollarSign,
  BadgeIndianRupee,
  Percent,
  PiggyBank,
  BarChart,
  Bitcoin,
  BadgeEuro,
  BadgePercent,
} from "lucide-react";
import GridMotion from "./bg";
import dynamic from "next/dynamic";

const iconComponents = [
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
  DollarSign,
  Wallet,
  Coins,
  WalletCards,
  HandCoins,
  CircleDollarSign,
  ReceiptCent,
  ChartPie,
  ChartBar,
  ChartLine,
  FileChartPie,
  BadgeDollarSign,
  BadgeIndianRupee,
  Percent,
  PiggyBank,
  BarChart,
  Bitcoin,
  BadgeEuro,
  BadgePercent,
];

function getRandomRotation() {
  return Math.floor(Math.random() * 360);
}

const items = [...iconComponents]
  .sort(() => Math.random() - 0.5)
  .map((Icon, i) => (
    <Icon
      key={i}
      style={{ transform: `rotate(${getRandomRotation()}deg)` }}
      className="size-36 text-background"
    />
  ));

const GridMotionNoSSR = dynamic(() => import("./bg"), {
  ssr: false,
});

const IconGrid = () => {
  return (
    <div>
      <div
        style={{ width: "100%", height: "100%", position: "absolute" }}
        className="bg-primary"
      >
        {/*<DotGrid
        dotSize={10}
        gap={15}
        baseColor="#f7fcfe"
        activeColor="#f7fcfe"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />*/}
        {/*<Silk
          speed={5}
          scale={1}
          color="#f7fcfe"
          noiseIntensity={1.5}
          rotation={0}
        />*/}

        <GridMotionNoSSR items={items} />
      </div>
      {/*<div className="w-full h-screen grid grid-cols-10 grid-rows-10 gap-1 bg-primary text-background overflow-hidden">
        {icons.map((icon, index) => (
          <div
            key={index}
            className="flex justify-center items-center w-full h-full transition-transform duration-500 hover:scale-125"
            style={{ transform: `rotate(${icon.rotation}deg)` }}
          >
            <icon.Icon size={30} />
          </div>
        ))}
      </div>*/}
    </div>
  );
};

export default IconGrid;
