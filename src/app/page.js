"use client";

import dynamic from "next/dynamic";

/* load the big component only in the browser */
const TravelRadiusExplorer = dynamic(
	() => import("../components/TravelRadiusExplorer"), // adjust path if needed
	{ ssr: false } // ← key line
);

export default function Home() {
	return <TravelRadiusExplorer />;
}
