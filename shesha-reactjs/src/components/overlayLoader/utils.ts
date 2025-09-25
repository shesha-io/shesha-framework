import {
  BarLoader,
  BeatLoader,
  BounceLoader,
  CircleLoader,
  ClipLoader,
  ClimbingBoxLoader,
  DotLoader,
  FadeLoader,
  GridLoader,
  HashLoader,
  MoonLoader,
  PacmanLoader,
  PropagateLoader,
  PulseLoader,
  RingLoader,
  RiseLoader,
  RotateLoader,
  ScaleLoader,
  SyncLoader,
} from 'react-spinners';

export type SpinnerStyles =
  | 'BarLoader' |
  'BeatLoader' |
  'BounceLoader' |
  'CircleLoader' |
  'ClipLoader' |
  'ClimbingBoxLoader' |
  'DotLoader' |
  'FadeLoader' |
  'GridLoader' |
  'HashLoader' |
  'MoonLoader' |
  'PacmanLoader' |
  'PropagateLoader' |
  'PulseLoader' |
  'RingLoader' |
  'RiseLoader' |
  'RotateLoader' |
  'ScaleLoader' |
  'SyncLoader';

export default (loader: SpinnerStyles) => {
  // type IStringObj = { [name: string]: string };
  const map: { [name: string]: any } = {
    BarLoader,
    BeatLoader,
    BounceLoader,
    CircleLoader,
    ClipLoader,
    ClimbingBoxLoader,
    DotLoader,
    FadeLoader,
    GridLoader,
    HashLoader,
    MoonLoader,
    PacmanLoader,
    PropagateLoader,
    PulseLoader,
    RingLoader,
    RiseLoader,
    RotateLoader,
    ScaleLoader,
    SyncLoader,
  };

  return map[loader.toString()];
};
