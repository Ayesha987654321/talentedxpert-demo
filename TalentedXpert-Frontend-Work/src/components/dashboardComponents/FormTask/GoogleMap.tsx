"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// interface GoogleMapProps {
//   address: string;
// }

// const GoogleMap: React.FC<GoogleMapProps> = ({ address }) => {
//   const mapRef = useRef<HTMLDivElement>(null);


//   // process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
//   useEffect(() => {
//     const loader = new Loader({
//       apiKey:  `${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`,
//       version: "weekly",
//     });

//     loader.load().then(() => {
//       if (!mapRef.current) return;

//       // Initialize geocoder
//       const geocoder = new google.maps.Geocoder();

//       geocoder.geocode({ address }, (results, status) => {
//         if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
//           const location = results[0].geometry.location;

//           // Initialize map
//           const map = new google.maps.Map(mapRef.current as HTMLElement, {
//             center: location,
//             zoom: 8,
//           });

//           // Add marker
//           new google.maps.Marker({
//             map,
//             position: location,
//           });
//         } else {
//           console.error(
//             `Geocode was not successful for the following reason: ${status}`
//           );
//         }
//       });
//     });
//   }, [address]);

//   return (
//     <div
//       ref={mapRef}
//       style={{
//         height: "400px",
//         width: "100%",
//       }}
//     />
//   );
// };

// export default GoogleMap;




interface GoogleMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect?: (lat: number, lng: number) => void; 
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  latitude, 
  longitude, 
  onLocationSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: `${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`,
      version: "weekly",
      libraries: ["maps", "marker"],
    });

    loader.load().then(async (google) => {
      if (!mapRef.current) return;

      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      // Initialize map
      const map = new Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 8,
        mapId: "YOUR_MAP_ID",
      });

      // Initial marker
      let marker = new AdvancedMarkerElement({
        map,
        position: { lat: latitude, lng: longitude },
      });

      // Add click event listener to the map
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();

          // Update the marker position
          marker.position = { lat: newLat, lng: newLng };

          // Update state
          setSelectedPosition({ lat: newLat, lng: newLng });

          // Call the callback function if provided
          if (onLocationSelect) {
            onLocationSelect(newLat, newLng);
          }
        }
      });
    }).catch(error => {
      console.error("Error loading Google Maps:", error);
    });
  }, [latitude, longitude, onLocationSelect]);

  return (
    <>
      <div
        ref={mapRef}
        style={{
          height: "400px",
          width: "100%",
        }}
      />
      {/* {selectedPosition && (
        <div>
          <p>Selected Location:</p>
          <p>Latitude: {selectedPosition.lat.toFixed(6)}</p>
          <p>Longitude: {selectedPosition.lng.toFixed(6)}</p>
        </div>
      )} */}
    </>
  );
};

export default GoogleMap;

