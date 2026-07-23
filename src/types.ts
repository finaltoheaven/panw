export type RuleAction = 'Allow' | 'Deny' | 'Drop' | 'Khác';

export interface SecurityRule {
  id: string;
  name: string;
  tags: string[];
  group: string;
  type: string;
  sourceZone: string;
  sourceAddress: string;
  sourceUser: string;
  sourceDevice: string;
  destinationZone: string;
  destinationAddress: string;
  destinationDevice: string;
  application: string[];
  service: string[];
  urlCategory: string;
  action: RuleAction;
  profile: string;
  options: string;
  ruleUuid: string;
  description: string;
  hitCount: number;
  hitCountFormatted: string;
  lastHit: string;
  firstHit: string;
  appsSeen: number;
  daysNoNewApps: number;
  modified: string;
  created: string;
  enabled: boolean;
  hasSchedule?: boolean;
}

export type ColumnKey =
  | 'name'
  | 'tags'
  | 'group'
  | 'type'
  | 'sourceZone'
  | 'sourceAddress'
  | 'sourceUser'
  | 'sourceDevice'
  | 'destinationZone'
  | 'destinationAddress'
  | 'destinationDevice'
  | 'application'
  | 'service'
  | 'urlCategory'
  | 'action'
  | 'profile'
  | 'options'
  | 'ruleUuid'
  | 'description'
  | 'hitCount'
  | 'lastHit'
  | 'firstHit'
  | 'appsSeen'
  | 'daysNoNewApps'
  | 'modified'
  | 'created';

export interface ColumnDefinition {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  minWidth?: string;
}

export interface RuleFilters {
  actions: {
    Allow: boolean;
    Deny: boolean;
    Drop: boolean;
    Khác: boolean;
  };
  status: {
    Enabled: boolean;
    Disabled: boolean;
  };
  trafficZeroHit: boolean;
  hasSchedule: boolean;
  timeRange: string;
  fromDate: string;
  toDate: string;
  searchQuery: string;
  sourceZoneFilter: string;
  destinationZoneFilter: string;
  actionFilter: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
