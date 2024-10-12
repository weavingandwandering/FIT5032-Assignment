// src/googleMapsLoader.js
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: import.meta.env.VITE_PLACES_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

export default loader;
