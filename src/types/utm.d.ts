declare module 'utm' {
  export function toLatLon(
    easting: number,
    northing: number,
    zoneNum: number,
    zoneLetter: string,
    northern?: boolean,
    strict?: boolean
  ): { latitude: number; longitude: number };
  export function fromLatLon(
    latitude: number,
    longitude: number,
    zoneNum?: number
  ): { easting: number; northing: number; zoneNum: number; zoneLetter: string };
}
