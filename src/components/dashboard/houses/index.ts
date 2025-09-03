export { default as HouseForm } from './HouseForm';
export { default as HouseList } from './HouseList';
export { default as HouseDetail } from './HouseDetail';
export { default as HousesManager } from './HousesManager';

// Re-export types from the service
export type {
  House,
  Leader,
  Location,
  SocialMedia,
  CreateHouseData,
  UpdateHouseData,
  HouseFilters,
  PaginationOptions
} from '../../../services/housesService';