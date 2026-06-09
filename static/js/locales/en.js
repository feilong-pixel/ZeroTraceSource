// SPDX-License-Identifier: MIT

export default {
  app: {
    intro: "Local source search and citation support.",
    subtitle: "Impact investigation workspace",
    title: "ZeroTraceSource"
  },
  dialog: {
    buttons: {
      cancel: "Cancel",
      confirm: "Confirm",
      ok: "OK"
    },
    title: {
      confirm: "Confirm",
      error: "Operation Failed",
      warning: "Warning"
    }
  },
  page: {
    actions: {
      add: "Add",
      copyCommand: "Copy Command",
      run: "Run Search",
      running: "Searching",
      saveConditions: "Save",
      saving: "Saving"
    },
    ai: {
      add: "Add",
      changeText: "Customer Change Description",
      generated: (count) => `Generated ${count} keyword candidates.`,
      generate: "Generate Keyword Candidates",
      generating: "Generating",
      placeholder: "Example: Change the Safety Strategy display label and control the behavior by approval status.",
      ready: "Candidates are not added automatically. Confirm them manually.",
      requireText: "Enter the customer change description.",
      subtitle: "Generate keyword candidates first; add them only after confirmation.",
      title: "AI Assistance"
    },
    commandPreview: "PowerShell Command Preview",
    conditions: {
      subtitle: "Enter the minimum inputs needed for field investigation.",
      title: "Investigation Conditions"
    },
    fields: {
      case: "Case",
      caseSensitive: "Case sensitive",
      contextLines: "Context Lines",
      excludes: "Skip paths containing",
      extensions: "Only search these extensions (optional)",
      keywords: "Keywords",
      outputDir: "Output Directory",
      outputPrefix: "File Prefix",
      roots: "Search Directories",
      title: "Investigation Title"
    },
    metrics: {
      keywords: "Keywords",
      output: "Output",
      roots: "Directories"
    },
    placeholders: {
      exclude: "For example old, backup, 退避, 検証用",
      keyword: "Enter a keyword; multi-line paste is supported",
      root: "Enter a specification, code, or other search directory"
    },
    reportSheets: "Report Sheets",
    result: {
      errors: "Errors",
      excelFiles: "Excel Files",
      matches: "Matches",
      textFiles: "Text Files",
      title: "Run Result"
    },
    run: {
      subtitle: "Call the search engine through the local Python web service.",
      title: "Run Investigation"
    },
    status: {
      copied: "Command copied.",
      copyFailed: "Copy failed. Select the command text manually.",
      ready: "Fill the conditions and run the search. Command preview is kept for checking.",
      runFailed: "Search failed. Check that the local web service is running.",
      running: "Searching. Please wait.",
      conditionsSaved: "Investigation conditions saved.",
      saveConditionsFailed: "Failed to save investigation conditions.",
      savingConditions: "Saving investigation conditions.",
      success: "Search complete. Report generated."
    }
  }
};
