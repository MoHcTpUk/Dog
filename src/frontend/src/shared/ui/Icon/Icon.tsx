import React from 'react';
import PlusIcon from '@shared/assets/icons/plus.svg?react';
import EditIcon from '@shared/assets/icons/edit.svg?react';
import CrossIcon from '@shared/assets/icons/cross.svg?react';
import CrossFilledIcon from '@shared/assets/icons/cross-filled.svg?react';
import TrashIcon from '@shared/assets/icons/trash.svg?react';
import StarIcon from '@shared/assets/icons/star.svg?react';
import StarFilledIcon from '@shared/assets/icons/star-filled.svg?react';
import BellIcon from '@shared/assets/icons/bell.svg?react';
import BellLargeIcon from '@shared/assets/icons/bell-large.svg?react';
import PlaneIcon from '@shared/assets/icons/plane.svg?react';
import TimeIcon from '@shared/assets/icons/time.svg?react';
import CheckIcon from '@shared/assets/icons/check.svg?react';
import CheckFilledIcon from '@shared/assets/icons/check-filled.svg?react';
import ExclamationIcon from '@shared/assets/icons/exclamation.svg?react';
import ArrowRightIcon from '@shared/assets/icons/arrow-right.svg?react';
import ArrowLeftIcon from '@shared/assets/icons/arrow-left.svg?react';
import PinFilledIcon from '@shared/assets/icons/pin-filled.svg?react';
import PinStrokeIcon from '@shared/assets/icons/pin-stroke.svg?react';
import PinStarIcon from '@shared/assets/icons/pin-star.svg?react';
import ListFilledIcon from '@shared/assets/icons/list-filled.svg?react';
import ListStrokeIcon from '@shared/assets/icons/list-stroke.svg?react';
import PawFilledIcon from '@shared/assets/icons/paw-filled.svg?react';
import PawStrokeIcon from '@shared/assets/icons/paw-stroke.svg?react';
import RouteIcon from '@shared/assets/icons/route.svg?react';
import RestaurantIcon from '@shared/assets/icons/restaurant.svg?react';
import CafeIcon from '@shared/assets/icons/cafe.svg?react';
import ShopIcon from '@shared/assets/icons/shop.svg?react';
import ParkIcon from '@shared/assets/icons/park.svg?react';
import CocktailIcon from '@shared/assets/icons/cocktail.svg?react';
import MallIcon from '@shared/assets/icons/mall.svg?react';
import LockIcon from '@shared/assets/icons/lock.svg?react';
import WifiIcon from '@shared/assets/icons/wifi.svg?react';
import SettingsIcon from '@shared/assets/icons/settings.svg?react';
import UpdateIcon from '@shared/assets/icons/update.svg?react';
import GeoIcon from '@shared/assets/icons/geo.svg?react';
import CameraIcon from '@shared/assets/icons/camera.svg?react';
import MenuDotsIcon from '@shared/assets/icons/menu-dots.svg?react';
import DrawerHandleIcon from '@shared/assets/icons/drawer-handle.svg?react';

export type IconName =
  | 'plus'
  | 'edit'
  | 'cross'
  | 'cross-filled'
  | 'trash'
  | 'star'
  | 'star-filled'
  | 'bell'
  | 'bell-large'
  | 'plane'
  | 'time'
  | 'check'
  | 'check-filled'
  | 'exclamation'
  | 'arrow-right'
  | 'arrow-left'
  | 'pin-filled'
  | 'pin-stroke'
  | 'pin-star'
  | 'list-filled'
  | 'list-stroke'
  | 'paw-filled'
  | 'paw-stroke'
  | 'route'
  | 'restaurant'
  | 'cafe'
  | 'shop'
  | 'park'
  | 'cocktail'
  | 'mall'
  | 'lock'
  | 'wifi'
  | 'settings'
  | 'update'
  | 'geo'
  | 'camera'
  | 'menu-dots'
  | 'drawer-handle';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconMap: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  plus: PlusIcon,
  edit: EditIcon,
  cross: CrossIcon,
  'cross-filled': CrossFilledIcon,
  trash: TrashIcon,
  star: StarIcon,
  'star-filled': StarFilledIcon,
  bell: BellIcon,
  'bell-large': BellLargeIcon,
  plane: PlaneIcon,
  time: TimeIcon,
  check: CheckIcon,
  'check-filled': CheckFilledIcon,
  exclamation: ExclamationIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  'pin-filled': PinFilledIcon,
  'pin-stroke': PinStrokeIcon,
  'pin-star': PinStarIcon,
  'list-filled': ListFilledIcon,
  'list-stroke': ListStrokeIcon,
  'paw-filled': PawFilledIcon,
  'paw-stroke': PawStrokeIcon,
  route: RouteIcon,
  restaurant: RestaurantIcon,
  cafe: CafeIcon,
  shop: ShopIcon,
  park: ParkIcon,
  cocktail: CocktailIcon,
  mall: MallIcon,
  lock: LockIcon,
  wifi: WifiIcon,
  settings: SettingsIcon,
  update: UpdateIcon,
  geo: GeoIcon,
  camera: CameraIcon,
  'menu-dots': MenuDotsIcon,
  'drawer-handle': DrawerHandleIcon,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  className
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      style={{ color }}
      className={className}
    />
  );
};
