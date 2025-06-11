import dynamic from 'next/dynamic';

// Dynamically import the TravelRadiusApp to avoid SSR issues with window
const TravelRadiusApp = dynamic(() => import('../components/TravelRadiusApp'), {
  ssr: false,
});

export default function Home() {
  return <TravelRadiusApp />;
}
