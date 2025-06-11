import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Navigation, Search } from 'lucide-react';

const TravelRadiusApp = () => {
  const [location, setLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [radius, setRadius] = useState(5); // km
  const [maxTravelTime, setMaxTravelTime] = useState(60); // minutes
  const [mode, setMode] = useState('distance'); // 'distance' or 'time'
  const [intersectionPoints, setIntersectionPoints] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const mapRef = useRef(null);
  const circleRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !location) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });

      setMap(map);
    };

    if (window.google) {
      initMap();
    } else {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [location]);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(pos);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a default location (e.g., Belgrade)
          setLocation({ lat: 44.8176, lng: 20.4633 });
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };

  // Draw circle on map
  const drawCircle = () => {
    if (!map || !location) return;

    // Remove existing circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    const circle = new window.google.maps.Circle({
      strokeColor: '#4F46E5',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4F46E5',
      fillOpacity: 0.15,
      map,
      center: location,
      radius: radius * 1000, // Convert km to meters
    });

    circleRef.current = circle;
    map.fitBounds(circle.getBounds());
  };

  // Simulate finding intersection points with streets
  const findIntersectionPoints = async () => {
    if (!location || !window.google) return;

    setIsLoading(true);

    // This is a simplified simulation - in reality, you'd use Roads API
    // to find actual street intersections within the circle
    const points = [];
    const numPoints = 16; // Generate points around the circle

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 360) / numPoints;
      const lat = location.lat + (radius / 111.32) * Math.cos(angle * Math.PI / 180);
      const lng = location.lng + (radius / (111.32 * Math.cos(location.lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);

      points.push({
        id: i,
        position: { lat, lng },
        estimatedTime: Math.floor(Math.random() * (radius * 8)) + 10, // Simulate travel time
        type: 'intersection'
      });
    }

    setIntersectionPoints(points);

    // Add markers to map
    points.forEach(point => {
      new window.google.maps.Marker({
        position: point.position,
        map,
        title: `Travel time: ~${point.estimatedTime} min`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#EF4444',
          fillOpacity: 0.8,
          strokeColor: '#DC2626',
          strokeWeight: 2,
        }
      });
    });

    setIsLoading(false);
  };

  // Find recommendations based on travel time
  const findRecommendations = async () => {
    if (!location) return;

    setIsLoading(true);

    // Simulate finding interesting places within travel time
    const mockRecommendations = [
      { name: 'City Park', type: 'Park', travelTime: 25, rating: 4.5 },
      { name: 'Art Museum', type: 'Museum', travelTime: 35, rating: 4.7 },
      { name: 'Historic District', type: 'Attraction', travelTime: 45, rating: 4.3 },
      { name: 'Riverside Café', type: 'Restaurant', travelTime: 20, rating: 4.6 },
      { name: 'Shopping Center', type: 'Shopping', travelTime: 50, rating: 4.2 },
    ].filter(place => place.travelTime <= maxTravelTime);

    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  useEffect(() => {
    if (map && location) {
      drawCircle();
    }
  }, [map, location, radius]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h1 className="text-3xl font-bold mb-2">Travel Radius Explorer</h1>
            <p className="text-blue-100">Discover where you can go based on distance or time</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location Settings
                  </h3>

                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {isLoading ? 'Getting Location...' : 'Get My Location'}
                  </button>

                  {location && (
                    <p className="text-sm text-gray-600 mt-2">
                      Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Search Mode</h3>

                  <div className="space-y-2 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value="distance"
                        checked={mode === 'distance'}
                        onChange={(e) => setMode(e.target.value)}
                        className="mr-2"
                      />
                      Distance-based
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value="time"
                        checked={mode === 'time'}
                        onChange={(e) => setMode(e.target.value)}
                        className="mr-2"
                      />
                      Time-based
                    </label>
                  </div>

                  {mode === 'distance' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Radius: {radius} km
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1km</span>
                        <span>50km</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Travel Time: {maxTravelTime} minutes
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="180"
                        value={maxTravelTime}
                        onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>15min</span>
                        <span>3h</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {mode === 'distance' ? (
                    <button
                      onClick={findIntersectionPoints}
                      disabled={!location || isLoading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Find Street Intersections
                    </button>
                  ) : (
                    <button
                      onClick={findRecommendations}
                      disabled={!location || isLoading}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Find Recommendations
                    </button>
                  )}
                </div>
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <div
                  ref={mapRef}
                  className="w-full h-96 lg:h-[500px] bg-gray-200 rounded-lg"
                  style={{ minHeight: '400px' }}
                >
                  {!location && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Click "Get My Location" to start
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results */}
            {mode === 'distance' && intersectionPoints.length > 0 && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Street Intersections ({intersectionPoints.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {intersectionPoints.slice(0, 8).map(point => (
                    <div key={point.id} className="bg-white p-3 rounded border">
                      <div className="text-sm">
                        <div className="font-medium">Point {point.id + 1}</div>
                        <div className="text-gray-600">~{point.estimatedTime} min travel</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'time' && recommendations.length > 0 && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Recommended Places</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((place, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{place.name}</h4>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {place.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Travel time: {place.travelTime} minutes</div>
                        <div>Rating: {place.rating}/5 ⭐</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelRadiusApp;
