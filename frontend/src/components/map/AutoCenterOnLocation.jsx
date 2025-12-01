import { useEffect } from "react";
import { useMap } from "react-leaflet";

// isme user ka locaiton aayega
const AutoCenterOnLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location && map) {
      // smooth transition to new location wehn user location changes
      map.flyTo(location, 7);
    }
  }, [location, map]); // dependent variable

  return null;
};

export default AutoCenterOnLocation;
