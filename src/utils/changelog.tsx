// 1. Increment LATEST_APP_VERSION
//  2.Change verisonNum of the first object in changeLogs to a string number (eg "3.0")
// 3. Add new object to changeLogs Array with its versionNum being the variable LATEST_APP_VERSION

export const LATEST_APP_VERSION = "5.2";

export const changeLogs = [
  {
    versionNum: LATEST_APP_VERSION,
    changes: [
      {
        heading: "New Feature: Monthly, Yearly & Overall Stats",
        text: (
          <>
            <strong>Added:</strong> You can now see your stats for a month, a
            year, or all the time you've been tracking. The status breakdown and
            reasons show data for the period and Salah you've selected. Overall
            shows a card for each year, and Yearly shows one for each month. Tap
            a year to see its months, then tap a month to open the calendar. You
            can still tap a date to see each Salah's status, reasons, and notes.
          </>
        ),
      },
      {
        heading: "New Feature: Your Best Month",
        text: (
          <>
            <strong>Added:</strong> Yearly view now shows the month with your
            highest percentage of Salah prayed in Jamaah (for men) or on time
            (for women). The current month isn't included, and a month needs at
            least 70% of its Salah entries filled in to count. Excused prayers
            don't count for or against women in this comparison.
          </>
        ),
      },
      {
        heading: "Improvement: A New Look for Stats",
        text: (
          <>
            <strong>Improved:</strong> The pie chart has been replaced with a
            bar and percentages for each status. The streak card, Salah buttons,
            and month and year controls have a new look too.
          </>
        ),
      },
      {
        heading: "Improvement: Tabs for Reasons",
        text: (
          <>
            <strong>Improved:</strong> You no longer need to swipe between
            reasons cards. Tap a status tab to see its top reasons, and tap
            "Show all" if there are more than three.
          </>
        ),
      },
      {
        heading: "Fix: Reasons Stats",
        text: (
          <>
            <strong>Fixed:</strong> If you move your tracking start date to a
            later date, reasons from before that date no longer appear in your
            stats.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "5.1",
    changes: [
      {
        heading: "New Feature: Bulk Salah Updates",
        text: (
          <>
            <strong>Added:</strong> Added the ability to update multiple Salah
            records at once across a selected date range.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "5.0",
    changes: [
      {
        heading: "Fix: Notification Timing Issues",
        text: (
          <>
            <strong>Fixed:</strong> Resolved an issue where per-Salah
            notifications and after-Isha notifications could appear at incorrect
            times in certain locales.
          </>
        ),
      },
      {
        heading: "Fix: Prayer Time Countdown Improvements",
        text: (
          <>
            <strong>Fixed:</strong> Resolved several issues affecting the prayer
            time countdown, including custom per-Salah adjustments not applying
            correctly, the countdown displaying inaccurate values when returning
            to the app from the background, and minor timing inaccuracies.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.9",
    changes: [
      {
        heading: "Fix: Calculation Method Update for Country Selection",
        text: (
          <>
            <strong>Fixed:</strong> Resolved an issue where changing the
            calculation method by selecting a country did not update the prayer
            time angles correctly. This could cause Fajr and Isha angles to
            remain unchanged from the previously selected method. If you have
            selected a country in the settings, please re-select it to ensure
            the correct calculation method and angles are applied.
          </>
        ),
      },
      {
        heading: "Improvement: Missed Salah Sheet Performance",
        text: (
          <>
            <strong>Improved:</strong> The Missed Salah sheet has been optimised
            to ensure smooth performance, even when you have a large number of
            missed prayers.
          </>
        ),
      },
      {
        heading: "Fix: Missed Salah Sheet Issue",
        text: (
          <>
            <strong>Fixed:</strong> Resolved an issue where actions like "Mark
            as Done" stopped working after returning to the app with the Missed
            Salah sheet open.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.8",
    changes: [
      {
        heading: "New Feature: Salah Times & bug fixes",
        text: (
          <>
            <strong>Feature:</strong> Salah times functionality added, minor
            bugs fixed.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.7",
    changes: [
      {
        heading: "Improved app restore and data handling",
        text: (
          <>
            <strong>Fixed:</strong> Further improved and resolved issues which
            were occurring when users were trying to reinstall the app on some
            devices.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.6",
    changes: [
      {
        heading: "Fixed reinstall issue on Android devices",
        text: (
          <>
            <strong>Fixed:</strong> Resolved issue that could stop the app from
            launching when restored from a device backup. The app now starts
            correctly after reinstalling.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.5",
    changes: [
      {
        heading: "Minor UI Improvement",
        text: (
          <>
            <strong>UI:</strong> Added borders to each setting option on the
            settings page
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.4",
    changes: [
      {
        heading: "UX/UI Improvements",
        text: (
          <>
            <strong>UI:</strong> Calendar now only shows the selected Salah when
            viewing individual Salah calendars.
            <br /> <br />
            <strong>UX:</strong> When all missed Salah are completed in the
            missed Salah sheet, a success message with a close button now
            appears.
            <br /> <br />
            <strong>UI:</strong> Notes box text now displays correctly in light
            mode.
            <br /> <br />
            <strong>UX:</strong> Onboarding flow improved
          </>
        ),
      },
      {
        heading: "Minor Bug Fixes",
        text: (
          <>
            <strong>BUG:</strong> Late status Salahs incorrectly showing orange
            color sometimes in the missed Salah sheet — now consistently red.
            <br /> <br />
            <strong>BUG:</strong> Fixed keyboard-triggered resize issue on some
            devices in the Edit Reasons sheet.
            <br /> <br />
            <strong>UI:</strong> Reasons box in the status sheet now has a fixed
            height to prevent layout issues.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.3",
    changes: [
      {
        heading: "Minor Bug Fix & Minor UI/UX Improvements",
        text: (
          <>
            <strong>Fixed:</strong> Resolved issue with 'Mark as done' button in
            the missed salah sheet not working correctly
            <br /> <br />
            <strong>UI:</strong> Minor UI/UX improvements have been made such as
            showing a scrollbar next to reasons in the salah update sheet
          </>
        ),
      },
      {
        heading: "Minor Bug Fix",
        text: (
          <>
            <strong>Bug:</strong> Fixed incorrect reason amounts outside of the
            "All" segment tab on the stats page.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.2",
    changes: [
      {
        heading: "Minor UX & UI Improvements",
        text: (
          <>
            <strong>UI:</strong> Text color in status sheet textarea is now
            black when in light theme mode for improved readability.
            <br /> <br />
            <strong>UX:</strong> The "Add New Reason" and "Revert to Default"
            icons in the Edit/Add Reasons sheet now always remain in view even
            when scrolling for easier access.
          </>
        ),
      },
      {
        heading: "Minor Bug Fix",
        text: (
          <>
            <strong>Bug:</strong> Fixed incorrect reason amounts outside of the
            "All" segment tab on the stats page.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.1",
    changes: [
      {
        heading: "Light Theme Mode",
        text: (
          <>
            <strong>UI:</strong> You can now switch between light, dark and
            system modes via the settings page.
          </>
        ),
      },
      {
        heading: "UI Improvements",
        text: (
          <>
            <strong>UX:</strong> Several UI changes bring the app in line with
            platform design standards — the Home icon now appears first in the
            navigation bar, and the missed Salah counter is now shown as a
            numbered circle.
          </>
        ),
      },
      {
        heading: "Bug Fixes",
        text: (
          <>
            <strong>Fixed:</strong> Resolved several bugs, including launch
            screen flicker and keyboard resize issues on some devices.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "4.0",
    changes: [
      {
        heading: "UX Improvement - Bottom Sheets",
        text: (
          <>
            <strong>UX:</strong> Bottom sheets are now more responsive and they
            slide up quicker and smoother than previously.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.9",
    changes: [
      {
        heading: "Notifications bug fix",
        text: (
          <>
            <strong>Fixed:</strong> Resolved an issue where notifications were
            not working on iOS devices, if you have had notifications turned on,
            please turn them off and back on again from the settings page and
            they will start working.{" "}
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.8",
    changes: [
      {
        heading: "Improved Stats Experience",
        text: (
          <>
            <strong>Donut Chart Restyle:</strong> The donut pie chart has been
            given a new look. You can now tap on the chart to toggle between
            percentage values and actual numbers. <br />
            <br />
            <strong>Per-Salah Stats:</strong> Statistics can now be viewed on a
            per-Salah basis.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.7",
    changes: [
      {
        heading: "UX Refinements",
        text: (
          <>
            <strong>Minor UX Improvements:</strong> Added animation to homepage
            streak counter, expanded click areas for the edit button and
            multi-edit icon, updated Salah table to show full day names.
            <br />
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.6",
    changes: [
      {
        heading: "Enhanced User Experience",
        text: (
          <>
            <strong>Page Transitions & Animations:</strong> Added smooth page
            transitions for a more seamless navigation experience. Introduced
            various animations, such as sliding and fading effects for
            edit/cancel buttons. Improved visual feedback with transitions when
            selecting reasons in the status sheet, and added animation effects
            to status boxes in the Salah table, along with other minor tweaks.
          </>
        ),
      },
      {
        heading: "Bug Fixes",
        text: (
          <>
            <strong>Layout & Overflow Issues:</strong> Resolved a sizing issue
            on certain devices where the status boxes in the status sheet
            appeared misaligned. Fixed an overflow issue with the progress bar
            in the reasons component on the stats page when only one reason was
            present.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.5",
    changes: [
      {
        heading: "Custom Reasons",
        text: (
          <>
            <strong>Feature:</strong> The reasons list (when updating a Salah)
            is now customizable! You can add and remove reasons from the
            settings page.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.4",
    changes: [
      {
        heading: "Open Source Release",
        text: (
          <>
            <strong>Announcement:</strong> In line with our commitment to
            transparency and our promise of being privacy-friendly, the app is
            now open source. A link to the applications source code can be found
            in the settings page.
          </>
        ),
      },
      {
        heading: "Minor UI/UX Improvements",
        text: (
          <>
            <strong>Improvements: </strong>
            Fixed an issue where the save button in the start date sheet was too
            low on iOS devices, made the save button clickable only when a date
            is selected, added a toast alert for start date changes, and
            resolved a visual issue on iOS devices where the input box was
            blank.
          </>
        ),
      },
      {
        heading: "Bug Fix",
        text: (
          <>
            <strong>Donut Pie Chart: </strong> Fixed an issue where the donut
            pie chart would occasionally pop in on the stats page on some
            devices, primarily affecting Android.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.3",
    changes: [
      {
        heading: "Streak Counter",
        text: (
          <>
            <strong>Feature:</strong> A streak counter to help you track your
            consecutive days of completed Salah.
          </>
        ),
      },
      {
        heading: "Custom Start Date",
        text: (
          <>
            <strong>Feature:</strong> You can now change the start date of the
            application, giving you the flexibility to begin tracking from any
            date of your choice.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.2",
    changes: [
      {
        heading: "Minor UI Fixes",
        text: (
          <>
            <strong>UI:</strong> Resolved issue with pie chart not animating and
            app content overlapping into the status bar on iOS devices.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.1",
    changes: [
      {
        heading: "Stats Page Enhancements",
        text: (
          <>
            <strong>Feature:</strong> Added a section on the stats page to
            display the top reasons for being late, missing, or praying Salah
            alone (males only). This feature draws information from
            user-selected statuses and reasons to provide meaningful insights.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "3.0",
    changes: [
      {
        heading: "Settings Page Enhancements",
        text: (
          <>
            <strong>Enhancement:</strong> Added review & share options in the
            Settings page, along with a website link.
          </>
        ),
      },
      {
        heading: "UI Improvements",
        text: (
          <>
            <strong>UI:</strong> Adjusted toggle colors on the settings page for
            notifications and missed Salah counter to ensure consistency.
          </>
        ),
      },
    ],
  },

  {
    versionNum: "2.9",
    changes: [
      {
        heading: "Privacy Policy Link",
        text: (
          <>
            <strong>Feature:</strong> Added a link to the privacy policy within
            the settings page.
          </>
        ),
      },
      {
        heading: "Enhanced Onboarding Process",
        text: (
          <>
            <strong>Feature:</strong> Improved onboarding process for new users,
            introduced new intro sheets that include an option to enable
            notifications.
          </>
        ),
      },
      {
        heading: "Tooltip for Missed Salah Counter",
        text: (
          <>
            <strong>UX:</strong> Added a tooltip to the missed Salah counter
            button to help users understand its functionality when it triggers
            for the first time.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "2.8",
    changes: [
      {
        heading: "Missed Salah Feature",
        text: (
          <>
            <strong>Feature:</strong> Introduced a convenient feature allowing
            easy completion of missed Salah. If any Salah is missed, a
            notification will appear in the top-left corner of the home page.
            Tapping on it will display a list of all missed Salah, which can
            then be marked as completed individually, this feature can be turned
            off from the settings page.
          </>
        ),
      },
      {
        heading: "Status Sheet Data Display Issue Resolved",
        text: (
          <>
            <strong>Fixed:</strong> Fixed an issue where the status update sheet
            was displaying data for a previous Salah that was just edited.
          </>
        ),
      },
      {
        heading: "Minor UI Enhancements",
        text: (
          <>
            <strong>UI:</strong> Added a backdrop color to sheets for better
            visibility. Donut chart labels now only appear when relevant data is
            present.
          </>
        ),
      },
    ],
  },

  {
    versionNum: "2.7",
    changes: [
      {
        heading: "Multi-Edit Mode",
        text: (
          <>
            <strong>Feature:</strong> Activate Multi-Edit Mode by tapping the
            icon at the top-left of the table. This allows you to edit multiple
            Salah entries across different dates at once, provided they share
            the same status, reasons, and notes. Individual Salah editing
            remains available with a simple tap.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "2.6",
    changes: [
      {
        heading: "Fixed Calendar Date Alignment",
        text: (
          <>
            <strong>Fixed:</strong> Resolved an issue where calendar dates were
            not correctly aligned with the weekday headers (Mon, Tue, Wed, etc).
            Dates now display under the correct day.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "2.5",
    changes: [
      {
        heading: "Notification Fixes",
        text: (
          <>
            <strong>Fixed:</strong> Resolved multiple issues with notifications
            not working consistently. <br />
            <strong>Note:</strong> If notifications haven’t been working, please
            toggle them off and back on in settings to reactivate.
          </>
        ),
      },
      {
        heading: "Minor UI & UX Enhancements",
        text: (
          <>
            <strong>
              Improved:
              <br />
            </strong>{" "}
            - Enhanced styling for the single-date sheet in the calendar view
            <br />
            - Status and handlebar colors now match the app's background on
            Android for a more consistent look
            <br />- Changelog can now be viewed at any time from the settings
            page
          </>
        ),
      },
      {
        heading: "General Bug Fixes",
        text: (
          <>
            <strong>
              Fixed:
              <br />
            </strong>
            - Resolved an issue with the Android notification icon displaying an
            exclamation mark instead of the app icon. <br />
            - Fixed a permissions bug where blocking notifications in system
            settings wasn't properly reflected in the app settings. <br />
            - Updated notification permission checks on app reinstall to ensure
            accurate toggle behavior in settings. <br />
            - Fixed issues with the Salah table not rendering when app data or
            cache is cleared. <br />- Improved notes entry field in the status
            update sheet which now expands dynamically as the user types, with a
            max height for readability.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "2.4",
    changes: [
      {
        heading: "Minor Bug Fixes",
        text: (
          <>
            <strong>Fixed</strong>: Addressed several minor bugs, including
            Salah status sheet not animating on the main page
          </>
        ),
      },
      {
        heading: "Various Improvements",
        text: (
          <>
            <strong>Improvements:</strong>: Adjusted calendar styling by
            removing unnecessary radials for a cleaner look, additional reasons
            added when selecting alone/late/missed options for a Salah.
          </>
        ),
      },
    ],
  },
  {
    versionNum: "2.3",
    changes: [
      {
        heading: "Import / Export Functionality",
        text: (
          <>
            <strong>Feature</strong>: Added import/export functionality for
            seamless data backup and restoration
          </>
        ),
      },
    ],
  },
  {
    versionNum: "2.2",
    changes: [
      {
        heading: "Notification Time Modification",
        text: (
          <>
            <strong>Fixed</strong>: Resolved an issue preventing users from
            modifying notification time settings.
          </>
        ),
      },
      {
        heading: "Salah Tracker - Day Visibility",
        text: (
          <>
            <strong>Improvement</strong>: Added day labels below dates in the
            Salah tracker for better clarity.
          </>
        ),
      },
    ],
  },
];
