import { calculationMethods } from "../utils/constants";

export type OnboardingMode = "newUser" | "salahTimes" | null;

export type CalculationMethodsType =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "MoonsightingCommittee"
  | "NorthAmerica"
  | "Singapore"
  | "Turkey"
  | "Tehran"
  | "";
// | "Not listed"

export type countryOptionsType =
  | "Egypt"
  | "Pakistan"
  | "Saudi Arabia"
  | "UAE"
  | "Qatar"
  | "Kuwait"
  | "Turkey"
  | "Iran"
  | "UK"
  | "US"
  | "Canada"
  | "Singapore"
  | "Malaysia"
  | "Indonesia"
  | "Not listed";

export type SalahNotificationSettings = "off" | "on" | "adhan";

type binaryValue = "0" | "1";

export type dailyNotificationOption = "afterIsha" | "fixedTime";

export interface userPreferencesType {
  userStartDate: string;
  userGender: string;
  dailyNotification: binaryValue;
  dailyNotificationTime: string;
  reasons: string[];
  showReasons: binaryValue;
  showMissedSalahCount: binaryValue;
  isExistingUser: binaryValue;
  isMissedSalahToolTipShown: binaryValue;
  appLaunchCount: string;
  saveButtonTapCount: string;
  haptics: binaryValue;
  theme: "dark" | "light" | "system";
  timeFormat: "12hr" | "24hr";
  prayerCalculationMethod: CalculationMethodsType;
  madhab: "hanafi" | "shafi";
  highLatitudeRule: "middleofthenight" | "seventhofthenight" | "twilightangle";
  fajrAngle: string;
  ishaAngle: string;
  fajrAdjustment: string;
  dhuhrAdjustment: string;
  asrAdjustment: string;
  maghribAdjustment: string;
  ishaAdjustment: string;
  shafaqRule: "general" | "ahmer" | "abyad";
  fajrNotification: SalahNotificationSettings;
  sunriseNotification: SalahNotificationSettings;
  dhuhrNotification: SalahNotificationSettings;
  asrNotification: SalahNotificationSettings;
  maghribNotification: SalahNotificationSettings;
  ishaNotification: SalahNotificationSettings;
  hasSeenBatteryPrompt: binaryValue;
  polarCircleResolution: "AqrabBalad" | "AqrabYaum" | "Unresolved";
  country: countryOptionsType | "";
  dailyNotificationOption: dailyNotificationOption;
  dailyNotificationAfterIshaDelay: string;
  lastLaunchDate: string;
}

export type calculationMethod = (typeof calculationMethods)[number];

export type PreferenceType = keyof userPreferencesType;

export type PreferenceObjType = {
  preferenceName: PreferenceType;
  preferenceValue: string;
};

export type LocationsDataObjType = {
  id: number;
  locationName: string;
  latitude: number;
  longitude: number;
  isSelected: number;
};

export type LocationsDataObjTypeArr = LocationsDataObjType[];

export type themeType = "light" | "dark" | "system";

export type SalahStatusType =
  | "group"
  | "male-alone"
  | "female-alone"
  | "late"
  | "missed"
  | "excused"
  | "";

export interface SalahsType {
  Fajr: SalahStatusType;
  Dhuhr: SalahStatusType;
  Asar: SalahStatusType;
  Asr?: SalahStatusType;
  Maghrib: SalahStatusType;
  Isha: SalahStatusType;
}

export interface SalahRecordType {
  date: string;
  salahs: SalahsType;
}

export type SalahRecordsArrayType = SalahRecordType[];

export interface StatsDateRangeType {
  start: Date;
  end: Date;
}

export interface SalahPeriodStatsType {
  period: string;
  totalStatusCount: number;
  statusCounts: {
    group: number;
    "male-alone": number;
    "female-alone": number;
    late: number;
    missed: number;
    excused: number;
  };
  statusPercentages: {
    group: number;
    "male-alone": number;
    "female-alone": number;
    late: number;
    missed: number;
    excused: number;
  };
}

export interface BestMonthStatsType {
  monthIndex: number;
  percentage: number;
  relevantStatusCount: number;
}

export type SalahDataType = {
  [date: string]: string[];
};

export type SalahNamesType =
  | "Fajr"
  | "Dhuhr"
  | "Asr"
  | "Asar"
  | "Maghrib"
  | "Isha";

export type SalahNamesTypeAdhanLibrary =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

// export type SalahNamesTypeAdhanLibrary =
//   | "none"
//   | "fajr"
//   | "sunrise"
//   | "dhuhr"
//   | "asr"
//   | "maghrib"
//   | "isha";

export type nextSalahTimeType = {
  currentSalah: string;
  nextSalah: SalahNamesTypeAdhanLibrary | "" | "none";
  nextSalahTime: Date | null;
  hoursRemaining: number;
  minsRemaining: number;
};

export type salahTimesObjType = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export interface SalahEntryType {
  salahName: SalahNamesType;
  salahStatus: SalahStatusType;
}

export type ReasonCountsByStatusType = {
  "male-alone": { [reason: string]: number };
  late: { [reason: string]: number };
  missed: { [reason: string]: number };
};

export type SalahByDateObjType = {
  [date: string]: SalahNamesType[];
};

export interface restructuredMissedSalahListProp {
  [date: string]: SalahNamesType;
}

export interface clickedDateDataObj {
  date: string;
  id: number | null;
  salahName: SalahNamesType;
  salahStatus: SalahStatusType;
  notes: string;
  reasons: string;
}

export type DBConnectionStateType = "open" | "close";

export type userGenderType = "male" | "female";

export type currentStartDateType = number;

export type DBResultDataObjType = {
  id: number;
  date: string;
  salahName: SalahNamesType;
  salahStatus: SalahStatusType;
  reasons: string;
  notes: string;
};

export type DBResultSalahStatusDataType = {
  date: string;
  salahName: SalahNamesType;
  salahStatus: SalahStatusType;
};

export type reasonsToShowType =
  | ""
  | "male-alone"
  | "late"
  | "missed"
  | undefined;

export type streakDatesObjType = {
  startDate: Date;
  endDate: Date;
  days: number;
  isActive: boolean;
  excusedDays: number;
};
