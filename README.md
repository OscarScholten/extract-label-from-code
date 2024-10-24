# VS Code Custom Label Replacer Plugin

This VS Code extension allows users to select text and replace it with a custom label. The label and the original text are added as a new entry in an XML file (`CustomLabels.labels-meta.xml`). The plugin also ensures that labels are inserted in lexicographical order and handles different file types by applying specific text replacements.

TODO:
- sorting is not correct (yet) - DC_payment is sorted before DC_payPeriod
- label needs to be added to translations file as well
- error handing might be better
- check if the label already exists

For inspiration: [the ChatGPT interactions](https://chatgpt.com/share/671a2818-924c-8001-8d25-161f4d05928c)

## Features

- Replaces selected text with a custom label entered by the user.
- Adds new labels to the `CustomLabels.labels-meta.xml` file located at `hr2day/main/default/labels/`.
- Inserts labels in **lexicographical order** based on the ASCII sort order of the `fullName` field.
- Maintains the **original line endings** of the XML file and uses **4-space indentation**.
- Handles different file types:
  - For **Visualforce** files (`*.page`), replaces selected text with `{$Labels.<label>}`.
  - For **Apex** files (`*.cls`), replaces selected text with `Labels.<label>` and removes surrounding single quotes in the text before inserting into XML.
  - For other file types, simply replaces the selected text with the entered label.

## How It Works

1. **Text Selection and Label Prompt**:
   - The user selects a portion of text.
   - The plugin prompts the user to enter a label name.

2. **Text Replacement**:
   - Based on the file type:
     - **Visualforce files (`*.page`)**: The selected text is replaced with `{$Labels.<label>}`.
     - **Apex classes (`*.cls`)**: The selected text is replaced with `Labels.<label>`, and any surrounding single quotes are removed before the text is inserted into the XML file.
     - **Other files**: The selected text is replaced with the entered label.

3. **Label Insertion**:
   - The entered label and the selected text are added to `CustomLabels.labels-meta.xml` in the following format:
   ```xml
   <labels>
       <fullName>label</fullName>
       <categories>actions</categories>
       <language>nl_NL</language>
       <protected>true</protected>
       <shortDescription></shortDescription>
       <value>selected text</value>
   </labels>
   FORMAT-END
   - Labels are inserted in **lexicographical order** based on the `fullName` field.
   - The XML file maintains the original **line endings** and uses **4-space indentation**.

## Installation

To install this plugin locally:

1. Clone the repository or download the project files.
2. Open the project in Visual Studio Code.
3. Press `F5` to run the plugin in a new VS Code window.

## Usage

1. **Select the text** you want to replace with a label.
2. Open the command palette with `Ctrl+Shift+P` and search for `Replace Text with Label`.
3. **Enter a label** for the selected text when prompted.
4. The selected text will be replaced according to the file type, and the label will be added to `CustomLabels.labels-meta.xml`.

## File Structure

```go
.vscode/
src/
  ├── extension.js               // Main extension code
hr2day/
  └── main/
      └── default/
          └── labels/
              └── CustomLabels.labels-meta.xml  // XML file where labels are added
README.md                          // Project documentation
package.json                       // Extension configuration
```

## Configuration

The extension automatically detects the workspace root and the location of the `CustomLabels.labels-meta.xml` file under the directory structure `hr2day/main/default/labels/`.

Make sure the workspace you open contains this structure.

## Development

1. Install [Node.js](https://nodejs.org/) (required for VS Code extension development).
2. Clone or download the repository.
3. Open the project in VS Code.
4. Press `F5` to open a new VS Code window and test the extension.

### Debugging

- You can set breakpoints in `src/extension.js` and run the extension in the new VS Code window for testing.
- Any issues with XML formatting or sorting will be logged in the output panel.

## Contribution

Feel free to open an issue or submit a pull request to improve the functionality or fix bugs.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
