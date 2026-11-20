import { render, screen } from "@testing-library/react";
import SalahTimesPage from "./SalahTimesPage";

import userEvent from "@testing-library/user-event";
import { act } from "react";
import {
  mockdbConnection,
  mockSetUserLocations,
  mockUserLocations,
  mockUserPrefs,
  mockUserPrefsState,
} from "../__mocks__/test-utils";

describe("Integration tests for Salah times page when no locations exist", () => {
  let addLocationBtn: HTMLButtonElement;
  beforeEach(() => {
    render(
      <SalahTimesPage
        dbConnection={mockdbConnection}
        setUserPreferences={mockUserPrefsState}
        userPreferences={mockUserPrefs}
        setUserLocations={mockSetUserLocations}
        userLocations={[]}
      />
    );
    addLocationBtn = screen.getByText(/Add Location/i);
  });

  it("shows fallback if no locations exist", () => {
    const fallbackText = screen.getByText("Salah Times Not Set");
    expect(fallbackText).toBeInTheDocument();

    expect(addLocationBtn).toBeInTheDocument();

    const salahNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    salahNames.forEach((salahName) => {
      const el = screen.getByText(salahName);
      expect(el).toBeInTheDocument();
    });
  });

  it("opens modal which displays different options to add a location when add location button button is clicked", async () => {
    await act(async () => {
      await userEvent.click(addLocationBtn);
    });

    const selectLocationText = await screen.findByText(
      /To calculate Salah times, the app requires your location, you can use one of the three methods below./i
    );
    expect(selectLocationText).toBeInTheDocument();
  });

  // describe("it opens the salah times settings sheet and renders relevant options", () => {

  it("opens location settings bottom sheet and renders relevant options", async () => {
    await act(async () => {
      await userEvent.click(addLocationBtn);
    });

    const selectLocationBtn = await screen.findByText(/add location/i);
    expect(selectLocationBtn).toBeInTheDocument();
    await userEvent.click(selectLocationBtn);

    const gpsBtn = await screen.findByText(/use device gps/i);
    expect(gpsBtn).toBeInTheDocument();

    const searchManuallyBtn = await screen.findByText(/search manually/i);
    expect(searchManuallyBtn).toBeInTheDocument();

    const enterCoordsText = await screen.findAllByText(/enter coordinates/i);
    expect(enterCoordsText).toHaveLength(2);

    // const longitudeInput = await screen.findByLabelText(/longitude/i);
    // expect(longitudeInput).toBeInTheDocument();
  });
  // });
});

describe("ingeration tests for when atleast one location exists", () => {
  beforeEach(async () => {
    render(
      <SalahTimesPage
        dbConnection={mockdbConnection}
        setUserPreferences={mockUserPrefsState}
        userPreferences={mockUserPrefs}
        setUserLocations={mockSetUserLocations}
        userLocations={mockUserLocations}
      />
    );

    const chevron = screen.getByLabelText(/show all locations/i);
    expect(chevron).toBeInTheDocument();
    // await waitFor(() => {
    await userEvent.click(chevron);
    // });
  });

  it("displays location (which has isSelected property set to 1) in both the salah times page and locations list bottom sheet", () => {
    const locationName = screen.getAllByText(/doha/i);
    expect(locationName).toHaveLength(2);
  });

  it("displays header text", async () => {
    const headingText = await screen.findByText(/locations/i);
    expect(headingText).toBeInTheDocument();
  });

  it("shows add new location fab", async () => {
    const addNewLocationBtn = screen.getByLabelText(/add new location/i);
    expect(addNewLocationBtn).toBeInTheDocument();
  });

  it("displays all locations", async () => {
    expect(screen.getAllByTestId("list-item")).toHaveLength(
      mockUserLocations.length
    );
  });

  it("displays edit icon on each list item", () => {
    const editBtn = screen.getAllByTestId(/edit-location-btn/i);
    expect(editBtn).toHaveLength(mockUserLocations.length);
  });

  it("displays delete icon on each list item", () => {
    const editBtn = screen.getAllByTestId(/delete-location-btn/i);
    expect(editBtn).toHaveLength(mockUserLocations.length);
  });

  it("prompts user to confirm they want to delete an item after user has tapped on the delete button", async () => {
    const deleteBtn = screen.getAllByTestId(/delete-location-btn/i);
    await userEvent.click(deleteBtn[0]);

    const actionSheetText = await screen.findByText(/delete Location?/i);
    expect(actionSheetText).toBeInTheDocument();
  });

  it("deletes item after user confirms decision", async () => {
    const deleteBtn = screen.getAllByTestId(/delete-location-btn/i);
    await userEvent.click(deleteBtn[0]);

    const actionSheetDeleteOption = await screen.findByText(
      /delete location?/i
    );
    expect(actionSheetDeleteOption).toBeInTheDocument();

    userEvent.click(actionSheetDeleteOption);
    const locationName = screen.queryByText(/doha/i);
    expect(locationName).not.toBeInTheDocument();

    const locationDeleteToast = await screen.findByTestId(
      "location-successfully-deleted-toast"
    );
    expect(locationDeleteToast).toBeInTheDocument();
  });

  it("does not delete item upon user cancelling deletion", () => {});

  // await waitFor(() => expect(true).toBe(true));
});
