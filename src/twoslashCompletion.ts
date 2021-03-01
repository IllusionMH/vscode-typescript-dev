import * as vscode from "vscode"

// Provides a hover with the full info for exceptions
export const twoslashCompetions: vscode.CompletionItemProvider = {
  provideCompletionItems: (document, position, cancel, context) => {
    const results: vscode.CompletionItem[] = []

    // Split everything the user has typed on the current line up at each space, and only look at the last word
    const range = new vscode.Range(
      new vscode.Position(position.line, 0),
      new vscode.Position(position.line, position.character)
    )
    const thisLine = document.getText(range)
    // Not a comment
    if (!thisLine.startsWith("//")) {
      return { items: [] }
    }

    const words = thisLine.replace("\t", "").split(" ")

    // Not the right amount of
    if (words.length !== 2) {
      return { items: [] }
    }

    const word = words[1]

    // Not a @ at the first word
    if (!word.startsWith("@")) {
      return { items: [] }
    }

    const workspace = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor!.document.uri)
    if (!workspace) return

    const workspaceRoot = workspace.uri.toString().replace("file://", "")
    const theirTS = require(workspaceRoot + "/node_modules/typescript")
    if (!theirTS) {
      vscode.window.showErrorMessage(
        `TSC Dev Ext: Could not find a copy of TypeScript at ${workspaceRoot + "/node_modules/typescript"}`
      )
      console.error("Could not find local copy of TS")
      return { items: [] }
    }

    // @ts-ignore - ts.optionDeclarations is private
    const optsNames: any[] = theirTS.optionDeclarations
    optsNames.forEach((opt) => {
      const name = opt.name
      if (name.startsWith(word.slice(1)) || word === "@") {
        // somehow adding the range seems to not give autocomplete results?
        results.push({
          label: name,
          kind: 14,
          detail: "Twoslash comment",
          insertText: name,
          documentation: opt.description?.message || "",
        })
      }
    })

    return {
      items: results,
    }
  },
}
