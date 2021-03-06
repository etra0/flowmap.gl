/*
 * Copyright 2018 Teralytics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { LocationProperties } from '@flowmap.gl/core';
import { BoundingBox, viewport } from '@mapbox/geo-viewport';
import { geoBounds } from 'd3-geo';
import { FeatureCollection, GeometryCollection, GeometryObject } from 'geojson';
import { ViewState } from 'react-map-gl';

export function getViewStateForFeatures(
  featureCollection: FeatureCollection<GeometryObject, LocationProperties> | GeometryCollection,
  size: [number, number],
  opts?: {
    pad?: number;
    tileSize?: number;
    minZoom?: number;
    maxZoom?: number;
  },
): ViewState {
  const { pad = 0.05, tileSize = 512, minZoom = 0, maxZoom = 100 } = opts || {};
  const [[x1, y1], [x2, y2]] = geoBounds(featureCollection as any);
  const bounds: BoundingBox = [x1 - pad * (x2 - x1), y1 - pad * (y2 - y1), x2 + pad * (x2 - x1), y2 + pad * (y2 - y1)];
  const {
    center: [longitude, latitude],
    zoom,
  } = viewport(bounds, size, undefined, undefined, tileSize, true);

  return {
    longitude,
    latitude,
    zoom: Math.max(Math.min(maxZoom, zoom), minZoom),
    bearing: 0,
    pitch: 0,
  };
}

export function getViewStateForLocations(
  locations: any[],
  getLocationCentroid: (location: any) => [number, number],
  size: [number, number],
  opts?: {
    pad?: number;
    tileSize?: number;
    minZoom?: number;
    maxZoom?: number;
  },
): ViewState {
  return getViewStateForFeatures(
    {
      type: 'GeometryCollection',
      geometries: locations.map(location => ({
        type: 'Point',
        coordinates: getLocationCentroid(location),
      })),
    } as any,
    size,
    opts,
  );
}
