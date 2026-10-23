import inside from 'point-in-polygon';

export type LatLngPolygon = Array<{
  lng: number;
  lat: number;
}>;

export type PointPolygon = number[][];

type SimplePointsArray = [number, number];
interface IFuncPointsArray {
  lat: () => number;
  lng: () => number;
}

const convertLatLngPolygonToPointsPolygon = (polygon: LatLngPolygon): number[][] =>
  polygon.map(({ lat, lng }) => [lat, lng]);

const convertFuncPointsArrayToSimplePointsArray = ({ lat, lng }: IFuncPointsArray): SimplePointsArray =>
  [lat(), lng()] as SimplePointsArray;

export const pointsInPolygon = (
  points: SimplePointsArray | IFuncPointsArray,
  polygon: LatLngPolygon | PointPolygon,
): boolean => {
  const pts: SimplePointsArray = !Array.isArray(points) ? convertFuncPointsArrayToSimplePointsArray(points) : points;

  const plgn = Array.isArray(polygon[0])
    ? (polygon as PointPolygon)
    : convertLatLngPolygonToPointsPolygon(polygon as LatLngPolygon);

  return inside(pts, plgn);
};
