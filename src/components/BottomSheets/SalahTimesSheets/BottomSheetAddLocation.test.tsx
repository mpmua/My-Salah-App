// const autoDetectBtn = await screen.findByText(/gps/i);
// expect(autoDetectBtn).toBeInTheDocument();

import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import * as constantsFile from "../../../utils/constants";
import * as dbUtilsFile from "../../../utils/dbUtils";
import { AndroidSettings } from "capacitor-native-settings";

// await userEvent.click(autoDetectBtn);
// await expect(Geolocation.checkPermissions()).resolves.toEqual({
//   location: "granted",
// });
// expect(Geolocation.getCurrentPosition).toHaveBeenCalled();

// Now ensure state and DB are updated
// UI should be updated with coords
// DB update function should be called

// Denied? Display alert to user
// Prompt? Await user choice
// Granted? Proceed with capturing coords
// coords would be captured
// state would be updated
// db would be updated via update db function

// it("handles location failure", () => {});
import { setupIonicReact } from "@ionic/react";

setupIonicReact({
  animated: false,
});

vi.mock("@ionic/react", async () => {
  const original: any = await vi.importActual("@ionic/react");
  return {
    ...original,
    IonModal: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock("@capacitor/geolocation", () => ({
  Geolocation: {
    getCurrentPosition: vi.fn().mockResolvedValue({
      coords: { latitude: 53.48, longitude: -3.44 },
    }),
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
  },
}));

import { Geolocation } from "@capacitor/geolocation";

import {
  mockdbConnection,
  mockSetUserLocations,
  mockUserLocations,
} from "../../../__mocks__/test-utils";
import { Capacitor } from "@capacitor/core";
import BottomSheetAddLocation from "./BottomSheetAddLocation";

const getPlatformSpy = vi.spyOn(Capacitor, "getPlatform");

const mocksetShowAddLocationSheet = vi.fn();
const mocksetShowSalahTimesSettingsSheet = vi.fn();

describe("tests for GPS location button when permission is prompt", () => {
  let gpsBtn: HTMLButtonElement;
  let promptSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "prompt",
      coarseLocation: "prompt",
    });

    getPlatformSpy.mockReturnValue("android");
    promptSpy = vi
      .spyOn(constantsFile, "promptToOpenDeviceSettings")
      .mockResolvedValue(undefined) as any;

    render(
      <BottomSheetAddLocation
        setShowAddLocationSheet={mocksetShowAddLocationSheet}
        showAddLocationSheet={true}
        setShowSalahTimesSettingsSheet={mocksetShowSalahTimesSettingsSheet}
        dbConnection={mockdbConnection}
        setUserLocations={vi.fn()}
        userLocations={mockUserLocations}
      />
    );

    gpsBtn = screen.getByText(/Use my location/i);
  });

  it("asks user for permission", async () => {
    await userEvent.click(gpsBtn);
    // expect(Geolocation.checkPermissions).toHaveBeenCalled();
    expect(Geolocation.requestPermissions).toHaveBeenCalled();
    expect(promptSpy).not.toHaveBeenCalled();
  });
});

describe("tests for GPS location button functionality when location permission is granted", () => {
  let gpsBtn: HTMLButtonElement;
  let promptSpy: ReturnType<typeof vi.spyOn>;
  let addUserLocationFunctionSpy: ReturnType<typeof vi.spyOn>;

  // const updatePrefsSpy = vi.spyOn(constantsFile, "updateUserPrefs");

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "granted",
      coarseLocation: "granted",
    });
    promptSpy = vi
      .spyOn(constantsFile, "promptToOpenDeviceSettings")
      .mockResolvedValue(undefined) as any;

    addUserLocationFunctionSpy = vi
      .spyOn(dbUtilsFile, "addUserLocation")
      .mockResolvedValue(undefined) as any;

    render(
      <BottomSheetAddLocation
        setShowAddLocationSheet={mocksetShowAddLocationSheet}
        showAddLocationSheet={true}
        setShowSalahTimesSettingsSheet={mocksetShowSalahTimesSettingsSheet}
        dbConnection={mockdbConnection}
        setUserLocations={vi.fn()}
        userLocations={mockUserLocations}
      />
    );
    gpsBtn = screen.getByText(/Use my location/i);
  });

  it("retrieves location coordinates", async () => {
    await expect(Geolocation.getCurrentPosition()).resolves.toEqual({
      coords: { latitude: 53.48, longitude: -3.44 },
    });

    await userEvent.click(gpsBtn);

    expect(Geolocation.checkPermissions).toHaveBeenCalled();
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).toHaveBeenCalled();

    // expect(updatePrefsSpy).toHaveBeenCalled();
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it("shows alert for user to name location after coordinates are retrieved", async () => {
    await userEvent.click(gpsBtn);

    const locationLoader = document.body.querySelector("ion-loading");
    expect(locationLoader).toBeInTheDocument();

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();
  });

  it("clears input upon save button being clicked and location being added successfully", async () => {
    await userEvent.click(gpsBtn);

    let input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "Berlin", { delay: 5 });
    expect(input).toHaveValue("Berlin");

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);

    await userEvent.click(gpsBtn);

    input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toHaveValue("");
  });

  it("clears input upon cancel button being clicked", async () => {
    await userEvent.click(gpsBtn);
    let input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "Berlin", { delay: 5 });
    expect(input).toHaveValue("Berlin");

    const cancelBtn = screen.getByText(/cancel/i);
    expect(cancelBtn).toBeInTheDocument();

    await userEvent.click(cancelBtn);
    await userEvent.click(gpsBtn);
    input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toHaveValue("");
  });

  it("updates DB with new location when the input is not blank", async () => {
    await userEvent.click(gpsBtn);

    const locationNameHeading = await screen.findByText(/enter location name/i);
    expect(locationNameHeading).toBeInTheDocument();

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "Berlin", { delay: 5 });
    expect(input).toHaveValue("Berlin");
    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);

    const errorText = screen.queryByText(/please enter a location name/i);
    expect(errorText).not.toBeInTheDocument();

    await waitFor(() => {
      expect(addUserLocationFunctionSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("does not update DB when input is blank and user presses save button", async () => {
    await userEvent.click(gpsBtn);

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);

    const errorText = await screen.findByText(/please enter a location name/i);
    expect(errorText).toBeVisible();
    await waitFor(() => {
      expect(addUserLocationFunctionSpy).not.toHaveBeenCalled();
      expect(mockSetUserLocations).not.toHaveBeenCalled();
    });
  });

  it("shows toast with success message after a location is successfully saved", async () => {
    await userEvent.click(gpsBtn);

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "Berlin", { delay: 5 });
    expect(input).toHaveValue("Berlin");

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);

    const toast = await screen.findByTestId(
      "location-successfully-added-toast"
    );

    expect(toast).toHaveAttribute("message", "Location added successfully");
    expect(toast).toHaveAttribute("is-open", "true");
  });

  it("clears error message upon user saving a location", async () => {
    await userEvent.click(gpsBtn);

    let input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);
    const errorText = await screen.findByText(/please enter a location name/i);
    expect(errorText).toBeVisible();

    await userEvent.type(input, "London", { delay: 5 });
    expect(input).toHaveValue("London");
    await userEvent.click(saveBtn);

    await userEvent.click(gpsBtn);
    input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    const errorTextQuery = screen.queryByText(/please enter a location name/i);
    expect(errorTextQuery).not.toBeInTheDocument();
  });

  it("clears error message upon user pressing cancel button", async () => {
    await userEvent.click(gpsBtn);

    let input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);
    const errorText = await screen.findByText(/please enter a location name/i);
    expect(errorText).toBeVisible();

    await userEvent.type(input, "London", { delay: 5 });
    expect(input).toHaveValue("London");

    const cancelBtn = await screen.findByText(/cancel/i);
    await userEvent.click(cancelBtn);

    await userEvent.click(gpsBtn);
    input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    const errorTextQuery = screen.queryByText(/please enter a location name/i);
    expect(errorTextQuery).not.toBeInTheDocument();
  });

  it("does not update DB or state when location name already exists", async () => {
    await userEvent.click(gpsBtn);

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    const saveBtn = await screen.findByText(/save/i);

    await userEvent.type(input, "Manchester", { delay: 5 });
    expect(input).toHaveValue("Manchester");
    await userEvent.click(saveBtn);

    const errorMsg = await screen.findByText(/location already exists/i);
    expect(errorMsg).toBeInTheDocument();

    await waitFor(() => {
      expect(addUserLocationFunctionSpy).not.toHaveBeenCalled();
      expect(mockSetUserLocations).not.toHaveBeenCalled();
    });
  });
});

describe("tests asserting location settings bottom sheet is triggered / not triggered upon user adding a location", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "granted",
      coarseLocation: "granted",
    });
  });

  it("opens the settings bottom sheet when a location is successfully detected and saved with no existing locations", async () => {
    render(
      <BottomSheetAddLocation
        setShowAddLocationSheet={mocksetShowAddLocationSheet}
        showAddLocationSheet={true}
        setShowSalahTimesSettingsSheet={mocksetShowSalahTimesSettingsSheet}
        dbConnection={mockdbConnection}
        setUserLocations={vi.fn()}
        userLocations={[
          {
            id: 1,
            isSelected: 0,
            latitude: 53.483959,
            locationName: "Manchester",
            longitude: -2.244644,
          },
        ]}
      />
    );
    const gpsBtn = screen.getByText(/Use my location/i);
    await userEvent.click(gpsBtn);

    const locationNameHeading = await screen.findByText(/enter location name/i);
    expect(locationNameHeading).toBeInTheDocument();

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "Berlin", { delay: 5 });

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);

    const selectCalcMethodBtn = await screen.findByText(
      /select calculation method/i
    );
    expect(selectCalcMethodBtn).toBeInTheDocument();

    const earlierAsrTimeText = await screen.findByText(/earlier asr time/i);
    expect(earlierAsrTimeText).toBeInTheDocument();

    const laterAsrTimeText = await screen.findByText(/later asr time/i);
    expect(laterAsrTimeText).toBeInTheDocument();
  });

  it("does not open the settings bottom sheet when a location is successfully detected and saved while other locations already exist", async () => {
    render(
      <BottomSheetAddLocation
        setShowAddLocationSheet={mocksetShowAddLocationSheet}
        showAddLocationSheet={true}
        setShowSalahTimesSettingsSheet={mocksetShowSalahTimesSettingsSheet}
        dbConnection={mockdbConnection}
        setUserLocations={vi.fn()}
        userLocations={mockUserLocations}
      />
    );

    const gpsBtn = screen.getByText(/Use my location/i);
    await userEvent.click(gpsBtn);

    const locationNameHeading = await screen.findByText(/enter location name/i);
    expect(locationNameHeading).toBeInTheDocument();

    const input = await screen.findByPlaceholderText(/e.g. home/i);
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "Berlin", { delay: 5 });

    const saveBtn = await screen.findByText(/save/i);
    await userEvent.click(saveBtn);

    const selectCalcMethodBtn = screen.queryByText(
      /select calculation method/i
    );
    expect(selectCalcMethodBtn).not.toBeInTheDocument();

    const earlierAsrTimeText = screen.queryByText(/earlier asr time/i);
    expect(earlierAsrTimeText).not.toBeInTheDocument();

    const laterAsrTimeText = screen.queryByText(/later asr time/i);
    expect(laterAsrTimeText).not.toBeInTheDocument();
  });
});

// describe("test for handling location detection failure", () => {
//   let gpsBtn: HTMLButtonElement;

//   beforeEach(() => {
//     vi.clearAllMocks();
//     vi.resetAllMocks();

//     getPlatformSpy.mockReturnValue("android");

//     vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
//       location: "granted",
//       coarseLocation: "granted",
//     });

//     render(
//       <BottomSheetAddLocation
//         setShowAddLocationSheet={mocksetShowAddLocationSheet}
//         showAddLocationSheet={true}
// setShowSalahTimesSettingsSheet = { mocksetShowSalahTimesSettingsSheet };
//         dbConnection={mockdbConnection}
//         setUserLocations={vi.fn()}
//         userLocations={mockUserLocations}
//         // setUserPreferences={mockUserPrefsState}
//       />
//     );
//     gpsBtn = screen.getByText(/Use my location/i);
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//     vi.resetAllMocks();
//   });

//   it("shows error message when app is unable to retrieve coords after user has granted location permission", async () => {
//     vi.mocked(Geolocation.getCurrentPosition).mockRejectedValue(
//       new Error("There was en error trying to obtain the location")
//     );
//     await userEvent.click(gpsBtn);

//     const toast = await screen.findByTestId("location-fail-toast");
//     expect(toast).toHaveAttribute(
//       "message",
//       "Unable to retrieve location, please try again"
//     );
//     expect(toast).toHaveAttribute("is-open", "true");
//   });
// });

describe("tests for GPS location button functionality when location permission is denied", () => {
  let gpsBtn: HTMLButtonElement;
  let promptSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(Geolocation.checkPermissions).mockResolvedValue({
      location: "denied",
      coarseLocation: "denied",
    });

    promptSpy = vi
      .spyOn(constantsFile, "promptToOpenDeviceSettings")
      .mockResolvedValue(undefined) as any;

    render(
      <BottomSheetAddLocation
        setShowAddLocationSheet={mocksetShowAddLocationSheet}
        showAddLocationSheet={true}
        setShowSalahTimesSettingsSheet={mocksetShowSalahTimesSettingsSheet}
        dbConnection={mockdbConnection}
        setUserLocations={vi.fn()}
        userLocations={mockUserLocations}
      />
    );
    gpsBtn = screen.getByText(/Use my location/i);
  });

  it("shows user a prompt to open system settings on Android when location permissions are turned off in system settings", async () => {
    getPlatformSpy.mockReturnValue("android");
    await userEvent.click(gpsBtn);

    expect(promptSpy).toHaveBeenCalledWith(
      expect.any(String),
      AndroidSettings.Location
    );
    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  it("shows user a prompt to open system settings on iOS when location permissions are turned off in system settings", async () => {
    getPlatformSpy.mockReturnValue("ios");
    await userEvent.click(gpsBtn);

    expect(promptSpy).toHaveBeenCalledWith(
      expect.any(String),
      AndroidSettings.Location
    );
    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
    expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });
});
