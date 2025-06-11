"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	MapContainer,
	TileLayer,
	Circle,
	Marker,
	Popup,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import cls from "./TravelRadiusExplorer.module.scss";
import { MapPin, Clock, Navigation, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";

/* —— Leaflet icon patch —— */
L.Browser.retina = false;
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* Haversine */
const distKm = (a, b) => {
	const R = 6371;
	const dLat = ((b.lat - a.lat) * Math.PI) / 180;
	const dLon = ((b.lng - a.lng) * Math.PI) / 180;
	const q =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((a.lat * Math.PI) / 180) *
			Math.cos((b.lat * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
};

export default function TravelRadiusExplorer() {
	/* ------- state ------- */
	const [location, setLocation] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [radius, setRadius] = useState(5);
	const [maxTravelTime, setMaxTravelTime] = useState(60);
	const [mode, setMode] = useState("distance");
	const [points, setPoints] = useState([]);
	const [recs, setRecs] = useState([]);

	/* ------- geolocation ------- */
	const getLoc = () => {
		setIsLoading(true);
		navigator.geolocation?.getCurrentPosition(
			({ coords }) => {
				setLocation({ lat: coords.latitude, lng: coords.longitude });
				setIsLoading(false);
			},
			() => {
				setLocation({ lat: 44.8176, lng: 20.4633 }); // Belgrade fallback
				setIsLoading(false);
			}
		);
	};

	/* ------- generators ------- */
	const genPoints = useCallback(() => {
		if (!location) return;
		const out = [];
		for (let i = 0; i < 16; i++) {
			const ang = (i * 360) / 16;
			const lat =
				location.lat + (radius / 111.32) * Math.cos((ang * Math.PI) / 180);
			const lng =
				location.lng +
				(radius / (111.32 * Math.cos((location.lat * Math.PI) / 180))) *
					Math.sin((ang * Math.PI) / 180);
			out.push({
				id: i,
				pos: { lat, lng },
				time: 20 + (i % 5) * 5,
				dist: distKm(location, { lat, lng }),
			});
		}
		setPoints(out);
	}, [location, radius]);

	const genRecs = () => {
		if (!location) return;
		const base = [
			["City Park", "Park", 25, 4.5],
			["Art Museum", "Museum", 35, 4.7],
			["Historic District", "Attraction", 45, 4.3],
			["Riverside Café", "Restaurant", 20, 4.6],
		];
		setRecs(
			base
				.filter(([, , t]) => t <= maxTravelTime)
				.map(([name, type, t, rating], i) => ({
					id: i,
					name,
					type,
					time: t,
					rating,
					pos: {
						lat: location.lat + 0.05 * Math.cos(i),
						lng: location.lng + 0.05 * Math.sin(i),
					},
				}))
		);
	};

	useEffect(() => {
		if (mode === "distance") genPoints();
	}, [mode, genPoints]);

	/* ------- fit helper ------- */
	function FitBounds({ center, radius }) {
		const map = useMap();
		useEffect(() => {
			if (!center) return;
			const fit = () => {
				map.invalidateSize();
				const meters = radius * 1000;
				map.fitBounds(L.latLng(center).toBounds(meters * 2), {
					padding: [20, 20],
				});
			};
			map._loaded ? fit() : map.once("load", fit);
			return () => map.off("load", fit);
		}, [map, center, radius]);
		return null;
	}

	/* -------- JSX -------- */
	return (
		<div className={cls.app}>
			<div className="container mx-auto">
				<div className={cls.card}>
					<header className={cls.header}>
						<h1>Travel Radius Explorer</h1>
						<p>Discover where you can go based on distance or time</p>
					</header>

					<main className={cls.content}>
						{/* sidebar */}
						<aside className={cls.controls}>
							{/* location */}
							<section className={cls.panel}>
								<h3>
									<MapPin size={18} /> Location Settings
								</h3>
								<button
									onClick={getLoc}
									disabled={isLoading}
									className={`${cls.btn} ${cls.primary}`}
								>
									<Navigation size={16} />
									{isLoading ? "Getting…" : "Get My Location"}
								</button>
								{location && (
									<p className="text-xs mt-2 text-gray-600">
										{location.lat.toFixed(4)}, {location.lng.toFixed(4)}
									</p>
								)}
							</section>

							{/* mode + sliders */}
							<section className={cls.panel}>
								<h3>Search Mode</h3>
								<label className="flex items-center mb-2">
									<input
										type="radio"
										value="distance"
										checked={mode === "distance"}
										onChange={() => setMode("distance")}
										className="mr-2"
									/>{" "}
									Distance
								</label>
								<label className="flex items-center mb-4">
									<input
										type="radio"
										value="time"
										checked={mode === "time"}
										onChange={() => setMode("time")}
										className="mr-2"
									/>{" "}
									Time
								</label>

								{mode === "distance" ? (
									<>
										<div className={cls["range-label"]}>
											Radius: {radius} km
										</div>
										<input
											type="range"
											min="1"
											max="50"
											value={radius}
											onChange={(e) => setRadius(+e.target.value)}
										/>
									</>
								) : (
									<>
										<div className={cls["range-label"]}>
											Max Travel Time: {maxTravelTime} min
										</div>
										<input
											type="range"
											min="15"
											max="180"
											value={maxTravelTime}
											onChange={(e) => setMaxTravelTime(+e.target.value)}
										/>
									</>
								)}
							</section>

							{/* green action button */}
							<section className={cls.panel}>
								<button
									disabled={!location}
									onClick={mode === "distance" ? genPoints : genRecs}
									className={`${cls.btn} ${cls.success}`}
								>
									{mode === "distance" ? (
										<>
											<Search size={16} /> &nbsp;Find Street Intersections
										</>
									) : (
										<>
											<Clock size={16} /> &nbsp;Find Recommendations
										</>
									)}
								</button>
							</section>
						</aside>

						{/* map */}
						<section className={cls.mapBox}>
							{location ? (
								<MapContainer
									center={[location.lat, location.lng]}
									zoom={13}
									scrollWheelZoom
									className={cls.map}
								>
									<TileLayer
										attribution="&copy; OSM &amp; CARTO"
										url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
										maxZoom={19}
										detectRetina={true}
									/>
									<Circle
										center={[location.lat, location.lng]}
										radius={radius * 1000}
										pathOptions={{ color: "#4F46E5", fillOpacity: 0.15 }}
									/>
									{(mode === "distance" ? points : recs).map((f) => (
										<Marker key={f.id} position={[f.pos.lat, f.pos.lng]}>
											<Popup>
												{mode === "distance" ? `~${f.time} min` : f.name}
											</Popup>
										</Marker>
									))}
									<FitBounds center={location} radius={radius} />
								</MapContainer>
							) : (
								<div className={cls.overlay}>
									<MapPin size={32} />
									Click &quot;Get My Location&quot; to start
								</div>
							)}
						</section>
					</main>

					{/* results */}
					{mode === "distance" && points.length > 0 && (
						<section className={cls.results}>
							<h3>Street Intersections ({points.length})</h3>
							<div className={`${cls.grid} ${cls.distance}`}>
								{points.slice(0, 8).map((p) => (
									<div key={p.id} className={cls.cardItem}>
										<div className={cls.title}>Point {p.id + 1}</div>
										<div className={cls.meta}>~{p.time} min</div>
									</div>
								))}
							</div>
						</section>
					)}

					{mode === "time" && recs.length > 0 && (
						<section className={cls.results}>
							<h3>Recommended Places</h3>
							<div className={cls.grid}>
								{recs.map((r) => (
									<div key={r.id} className={cls.cardItem}>
										<div className={cls.title}>{r.name}</div>
										<div className={cls.meta}>
											~{r.time} min — {r.rating}★
										</div>
									</div>
								))}
							</div>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
