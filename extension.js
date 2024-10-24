const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

/**
 * @param {vscode.ExtensionContext} context
 * 
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.replaceWithLabel', async function () {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let selectedText = document.getText(selection);
            const fileName = document.fileName;
            const fileExtension = path.extname(fileName);

            // Prompt the user for a label
            const label = await vscode.window.showInputBox({
                prompt: 'Enter a label for the selected text'
            });

            if (!label) {
                vscode.window.showErrorMessage('Label is required!');
                return;
            }

            // Handle text replacement based on file extension
            if (fileExtension === '.page') {
                // For Visualforce files, replace with {$Labels.label}
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, `{$Labels.${label}}`);
                });
            } else if (fileExtension === '.cls') {
                // For Apex classes, replace with Labels.label and remove surrounding single quotes from the selected text
                selectedText = selectedText.replace(/^'(.*)'$/, '$1'); // Removes single quotes around the selected text
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, `Labels.${label}`);
                });
            } else {
                // Default case: simply replace with the label in other files
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, label);
                });
            }

            // Get the workspace root path
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('Open a workspace to save to the XML file');
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;

            // Path to the XML file
            const xmlFilePath = path.join(workspacePath, 'hr2day', 'main', 'default', 'labels', 'CustomLabels.labels-meta.xml');

            // Read and update the XML file
            if (!fs.existsSync(xmlFilePath)) {
                vscode.window.showErrorMessage('CustomLabels.labels-meta.xml not found');
                return;
            }

            // Read the XML file content
            const xmlData = fs.readFileSync(xmlFilePath, 'utf8');

            // Detect the line ending style in the original file
            const lineEnding = xmlData.includes('\r\n') ? '\r\n' : '\n';

            // Parse the XML file
            const parser = new xml2js.Parser();
            const builder = new xml2js.Builder({
                headless: true,
                renderOpts: { 
                    pretty: true,
                    indent: '    ',  // 4 spaces for indentation
                    newline: lineEnding  // Use the same line ending as the original file
                }
            });

            parser.parseString(xmlData, function (err, result) {
                if (err) {
                    vscode.window.showErrorMessage('Error parsing XML file');
                    return;
                }

                // Check if <CustomLabels> exists
                if (!result.CustomLabels) {
                    vscode.window.showErrorMessage('Invalid CustomLabels.labels-meta.xml structure');
                    return;
                }

                // Create the new label element
                const newLabel = {
                    fullName: [label],  // fullName should be an array with one string element
                    categories: ['actions'],
                    language: ['nl_NL'],
                    protected: ['true'],
                    shortDescription: [''],
                    value: [selectedText]  // value should be an array with one string element
                };

                // Append the new label to the existing labels
                if (!result.CustomLabels.labels) {
                    result.CustomLabels.labels = [];
                }

                // Insert the new label in lexicographical order based on `fullName`
                const labelsArray = result.CustomLabels.labels;
                labelsArray.push(newLabel);
                labelsArray.sort((a, b) => a.fullName[0].localeCompare(b.fullName[0]));

                // Convert back to XML
                const updatedXml = builder.buildObject(result);

                // Write back to the XML file
                fs.writeFileSync(xmlFilePath, updatedXml);

                vscode.window.showInformationMessage(`Added label "${label}" to CustomLabels.labels-meta.xml`);
            });
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
