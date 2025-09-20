import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

//  -------------- adding red and blue icons
//  Any default marker you add (without custom icon) will show correctly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

//Creating a Red Marker Icon

export const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// blue numbered icon

export const createBlueNumberedIcon = (number) => {
  return new L.DivIcon({
    className: "custom-div-icon",
    html: `
      <div style="position: relative; width: 30px; height: 41px;">
        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style="width: 30px; height: 41px;" />
        <div style="
          position: absolute; 
          top: 3px; 
          left: 0; 
          width: 30px; 
          text-align: center; 
          color: white; 
          font-weight: 900; 
          font-size: 16px; 
          text-shadow: 
            1px 1px 3px #000000,
            -1px -1px 3px #000000,
            1px -1px 3px #000000,
            -1px 1px 3px #000000,
            0px 0px 4px #000000;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          line-height: 22px;
          margin-left: 4px;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
        ">
          ${number}
        </div>
      </div>`,
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [1, -34],
  });
};
