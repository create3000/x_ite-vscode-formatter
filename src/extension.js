// The module "vscode" contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require ("vscode");

// Create output channel
// const output = vscode .window .createOutputChannel ("X_ITE Formatter");
// output .appendLine ("X_ITE Formatter started.");

/**
 *
 * @param {vscode.TextDocument} document
 * @param {vscode.Range} range
 * @param {vscode.FormattingOptions} options
 * @returns [vscode.TextEdit]
 */
async function format (document, range, options = { insertSpaces: true, tabSize: 2 })
{
   const X3D = require ("x_ite-node");

   if (!range)
   {
      // Format full document.

      const
         start = new vscode .Position (0, 0),
         end   = new vscode .Position (document .lineCount - 1, document .lineAt (document .lineCount - 1) .text .length);

      range = new vscode .Range (start, end);
   }

   const
      canvas  = X3D .createBrowser (),
      browser = canvas .browser;

   browser .endUpdate ();
   browser .setBrowserOption ("LoadUrlObjects", false);
   browser .setBrowserOption ("Mute",           true);

   const
      content    = document .getText (range),
      scene      = await browser .createX3DFromString (content),
      encoding   = { XML: "XML", JSON: "JSON", VRML: "VRML" } [scene .encoding] ?? "XML",
      indentChar = options .insertSpaces ? " " .repeat (options .tabSize) : "\t",
      formatted  = scene [`to${encoding}String`] ({ style: "COMPACT", indentChar }) .trim () + "\n",
      result     = [new vscode .TextEdit (range, formatted)];

   browser .dispose ();

   return result;
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate (context)
{
   for (const encoding of ["X3D", "VRML"])
   {
      context .subscriptions .push (vscode .languages .registerDocumentFormattingEditProvider (encoding,
      {
         provideDocumentFormattingEdits: (document, options, token) =>
         {
            return format (document, null, options);
         },
      }));

      // context .subscriptions .push (vscode .languages .registerDocumentRangeFormattingEditProvider (encoding,
      // {
      //    provideDocumentRangeFormattingEdits: (document, range, options, token) =>
      //    {
      //       const
      //          start = new vscode .Position(0, 0),
      //          end   = new vscode .Position (document .lineCount - 1, document .lineAt (document .lineCount - 1) .text .length);

      //       return format (document, new vscode .Range (start, end), options)
      //    },
      // }));
   }
}

module .exports = {
   format,
   activate,
};
