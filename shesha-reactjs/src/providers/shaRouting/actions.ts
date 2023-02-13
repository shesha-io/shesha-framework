import { createAction } from 'redux-actions';
import { IRoute } from '../..';

export enum RouteActionEnums {
  GoingToRoute = 'GOING_TO_ROUTE',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const goingToRouteAction = createAction<IRoute, string>(RouteActionEnums.GoingToRoute, nextRoute => ({
  nextRoute,
}));

/* NEW_ACTION_GOES_HERE */
