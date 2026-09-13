import siteConfig from './site-config.json';

export interface SiteConfig {
  ENABLE_VOLUNTEER: boolean;
  ENABLE_TOP_RIBBON: boolean;
  ENABLE_ABOUT_DROPDOWN: boolean;
  ENABLE_LEADERSHIP: boolean;
  ENABLE_MEMBERSHIP: boolean;
  ENABLE_MEMBERSHIP_REGISTRATION: boolean;
  ENABLE_TELUGU_BUSINESS: boolean;
  ENABLE_MEMBER_PORTAL: boolean;
  ENABLE_LOGIN: boolean;
  ENABLE_SEARCH: boolean;
  ENABLE_CHARITY_HELP: boolean;
  ENABLE_DONATIONS: boolean;
  ENABLE_POOJA_BOOKING: boolean;
}

export const SITE_CONFIG: SiteConfig = siteConfig;
