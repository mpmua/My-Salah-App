import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  IonContent,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  isPlatform,
} from "@ionic/react";
import {
  calculationMethod,
  CalculationMethodsType,
  countryOptionsType,
  LocationsDataObjTypeArr,
  userPreferencesType,
} from "../types/types";
import { prayerCalculationMethodLabels } from "../utils/constants";
import { setAdhanLibraryDefaults, updateUserPrefs } from "../utils/helpers";

interface CalculationMethodOptionsProps {
  dbConnection: React.MutableRefObject<SQLiteDBConnection | undefined>;
  setUserPreferences: React.Dispatch<React.SetStateAction<userPreferencesType>>;
  userPreferences: userPreferencesType;
  userLocations: LocationsDataObjTypeArr;
  setSegmentOption: React.Dispatch<React.SetStateAction<"manual" | "country">>;
  segmentOption: "manual" | "country";
  children?: React.ReactNode;
}

const CalculationMethodOptions = ({
  dbConnection,
  setSegmentOption,
  segmentOption,
  userLocations,
  userPreferences,
  setUserPreferences,
  children,
}: CalculationMethodOptionsProps) => {
  const countryOptions: countryOptionsType[] = [
    "Canada",
    "Egypt",
    "Indonesia",
    "Iran",
    "Kuwait",
    "Malaysia",
    "Pakistan",
    "Qatar",
    "Saudi Arabia",
    "Singapore",
    "Turkey",
    "UAE",
    "UK",
    "US",
    "Not listed",
  ];

  const calculationMethodsDetails: {
    calculationMethod: calculationMethod;
    description: string;
  }[] = [
    {
      calculationMethod: "Dubai",
      description:
        "Used in the UAE. Slightly earlier Fajr time and slightly later Isha time with angles of 18.2° for Fajr and Isha in addition to 3 minute offsets for sunrise, Dhuhr, Asr, and Maghrib.",
    },
    {
      calculationMethod: "Egyptian",
      description:
        "Early Fajr time using an angle 19.5° and a slightly earlier Isha time using an angle of 17.5°.",
    },
    {
      calculationMethod: "Karachi",
      description:
        "University of Islamic Sciences, Karachi. A generally applicable method that uses standard Fajr and Isha angles of 18°.",
    },
    {
      calculationMethod: "Kuwait",
      description:
        "Standard Fajr time with an angle of 18°. Slightly earlier Isha time with an angle of 17.5°.",
    },
    {
      calculationMethod: "MoonsightingCommittee",
      description:
        "Uses standard 18° angles for Fajr and Isha in addition to seasonal adjustment values. This method automatically applies the 1/7 approximation rule for locations above 55° latitude.",
    },
    {
      calculationMethod: "MuslimWorldLeague",
      description:
        "Standard Fajr time with an angle of 18°. Earlier Isha time with an angle of 17°.",
    },
    {
      calculationMethod: "NorthAmerica",
      description:
        "Islamic Society of North America. Can be used for North America, but the Moonsighting Committee method is preferable. Gives later Fajr times and early Isha times with angles of 15°.",
    },
    {
      calculationMethod: "Qatar",
      description:
        "Same Isha interval as ummAlQura but with the standard Fajr time using an angle of 18°.",
    },
    {
      calculationMethod: "Singapore",
      description:
        "Early Fajr time with an angle of 20° and standard Isha time with an angle of 18°.",
    },
    {
      calculationMethod: "Tehran",
      description:
        "Institute of Geophysics, University of Tehran. Early Isha time with an angle of 14°. Slightly later Fajr time with an angle of 17.7°. Calculates Maghrib based on the sun reaching an angle of 4.5° below the horizon.",
    },
    {
      calculationMethod: "Turkey",
      description:
        "An approximation of the Diyanet method used in Turkey. This approximation is less accurate outside the region of Turkey.",
    },
    {
      calculationMethod: "UmmAlQura",
      description:
        "Uses a fixed interval of 90 minutes from maghrib to calculate Isha. And a slightly earlier Fajr time with an angle of 18.5°. Note: you should add a +30 minute custom adjustment for Isha during Ramadan.",
    },
  ];

  const countryToMethod: Record<countryOptionsType, CalculationMethodsType> = {
    Canada: "NorthAmerica",
    Egypt: "Egyptian",
    Indonesia: "Singapore",
    Iran: "Tehran",
    Kuwait: "Kuwait",
    Malaysia: "Singapore",
    Pakistan: "Karachi",
    Qatar: "Qatar",
    "Saudi Arabia": "UmmAlQura",
    Singapore: "Singapore",
    Turkey: "Turkey",
    UAE: "Dubai",
    UK: "MoonsightingCommittee",
    US: "NorthAmerica",
    "Not listed": "MuslimWorldLeague",
  };

  return (
    <IonContent className="[--background:var(--sheet-bg-color)]">
      <section
        className={`px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] ${children ? "pt-8" : ""}`}
      >
        {children}
        <IonSegment
          className="stats-period-segment ![--background:var(--sheet-pill-bg)]"
          mode="ios"
          value={segmentOption}
          onIonChange={(e) => {
            setSegmentOption(e.detail.value as "country" | "manual");
          }}
        >
          <IonSegmentButton
            className="stats-period-segment-button"
            value="country"
          >
            <IonLabel>By country</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton
            className="stats-period-segment-button"
            value="manual"
          >
            <IonLabel>Choose method</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        {segmentOption === "country" && (
          <section className="mt-6">
            <div className="sheet-group px-4">
              <IonSelect
                placeholder="Select country"
                value={userPreferences.country || undefined}
                label="Country"
                interfaceOptions={{ mode: isPlatform("ios") ? "ios" : "md" }}
                onIonChange={async (e) => {
                  const selectedCountry: countryOptionsType = e.detail.value;

                  const method = countryToMethod[selectedCountry];

                  if (!method) {
                    console.error("No option selected");
                    return;
                  }

                  await setAdhanLibraryDefaults(
                    dbConnection,
                    method,
                    setUserPreferences,
                    userPreferences,
                    userLocations,
                  );
                  // await updateUserPrefs(
                  //   dbConnection,
                  //   "prayerCalculationMethod",
                  //   countryToMethod[selectedCountry],
                  //   setUserPreferences,
                  // );
                  await updateUserPrefs(
                    dbConnection,
                    "country",
                    selectedCountry,
                    setUserPreferences,
                  );
                }}
              >
                {countryOptions.map((country) => (
                  <IonSelectOption
                    // style={{ color: "red" }}
                    key={country}
                    value={country}
                  >
                    {country}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
            {userPreferences.country !== "" && (
              <div className="mt-4 rounded-2xl border border-[color:var(--sheet-group-border)] bg-[var(--sheet-group-bg)] p-4">
                <p className="text-sm font-semibold text-[var(--secondary-text-color)]">
                  Calculation method
                </p>
                <p className="mt-1 text-[1.0625rem] font-semibold leading-snug">
                  {
                    prayerCalculationMethodLabels[
                      userPreferences.prayerCalculationMethod
                    ]
                  }
                </p>
                <p className="mt-2 text-sm leading-snug text-[var(--secondary-text-color)]">
                  {userPreferences.country === "Not listed"
                    ? "Muslim World League (MWL) has been set as the default method because your country is not listed."
                    : `Selected for ${userPreferences.country}.`}{" "}
                  If times differ from your local mosque, please confirm the
                  correct settings with a local imam.
                </p>
              </div>
            )}
          </section>
        )}
        {segmentOption === "manual" && (
          <IonRadioGroup value={userPreferences.prayerCalculationMethod}>
            <section className="mt-4 mb-[15rem] divide-y divide-[color:var(--sheet-divider-color)]">
              {calculationMethodsDetails.map((item, i) => {
                return (
                  <div
                    key={`${item}${i}`}
                    onClick={async () => {
                      if (
                        userPreferences.prayerCalculationMethod ===
                        item.calculationMethod
                      ) {
                        return;
                      }
                      await setAdhanLibraryDefaults(
                        dbConnection,
                        item.calculationMethod,
                        setUserPreferences,
                        userPreferences,
                        userLocations,
                      );
                      await updateUserPrefs(
                        dbConnection,
                        "country",
                        "",
                        setUserPreferences,
                      );
                    }}
                  >
                    <IonRadio
                      mode={isPlatform("ios") ? "ios" : "md"}
                      value={item.calculationMethod}
                      labelPlacement="start"
                      justify="space-between"
                      className="pointer-events-none w-full py-3.5 text-base font-semibold leading-snug [--color:var(--secondary-text-color)] [&::part(label)]:whitespace-normal"
                    >
                      <span>
                        {prayerCalculationMethodLabels[item.calculationMethod]}
                        <span className="mt-1 block text-sm font-normal leading-snug text-[var(--secondary-text-color)]">
                          {item.description}
                        </span>
                      </span>
                    </IonRadio>
                  </div>
                );
              })}
            </section>
          </IonRadioGroup>
        )}
      </section>
    </IonContent>
  );
};

export default CalculationMethodOptions;
