module.exports = {
  languages: {
    register: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    setLanguageConfiguration: jest.fn(),
    registerCompletionItemProvider: jest.fn(),
    CompletionItemKind: {
      Keyword: 14,
      TypeParameter: 25,
      Snippet: 27
    },
    CompletionItemInsertTextRule: {
      InsertAsSnippet: 4
    }
  }
};
