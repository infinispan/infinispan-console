import * as monaco from 'monaco-editor';

const PROTO_LANGUAGE_ID = 'protobuf';

let registered = false;

const keywords = [
  'syntax', 'import', 'weak', 'public', 'package', 'option',
  'message', 'enum', 'service', 'rpc', 'returns', 'stream',
  'extend', 'oneof', 'map', 'reserved', 'to', 'extensions',
  'optional', 'required', 'repeated', 'group'
];

const typeKeywords = [
  'double', 'float', 'int32', 'int64', 'uint32', 'uint64',
  'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64',
  'bool', 'string', 'bytes'
];

export function registerProtobufLanguage() {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: PROTO_LANGUAGE_ID });

  // Language configuration: brackets, comments, auto-closing, folding
  monaco.languages.setLanguageConfiguration(PROTO_LANGUAGE_ID, {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    folding: {
      markers: {
        start: /^\s*(message|enum|service|oneof|extend)\b/,
        end: /^\s*\}/
      }
    },
    indentationRules: {
      increaseIndentPattern: /\{\s*$/,
      decreaseIndentPattern: /^\s*\}/
    }
  });

  // Syntax highlighting
  monaco.languages.setMonarchTokensProvider(PROTO_LANGUAGE_ID, {
    keywords,
    typeKeywords,
    constants: ['true', 'false'],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/\b\d+\b/, 'number'],
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@constants': 'constant',
              '@default': 'identifier'
            }
          }
        ]
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment']
      ]
    }
  });

  // Auto-completion
  monaco.languages.registerCompletionItemProvider(PROTO_LANGUAGE_ID, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const snippets: monaco.languages.CompletionItem[] = [
        {
          label: 'message',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'message ${1:Name} {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a new message type',
          range
        },
        {
          label: 'enum',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'enum ${1:Name} {\n\t${2:UNKNOWN} = 0;\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a new enum type',
          range
        },
        {
          label: 'service',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'service ${1:Name} {\n\trpc ${2:Method} (${3:Request}) returns (${4:Response});\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a new service',
          range
        },
        {
          label: 'rpc',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'rpc ${1:Method} (${2:Request}) returns (${3:Response});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define an RPC method',
          range
        },
        {
          label: 'oneof',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'oneof ${1:name} {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a oneof field group',
          range
        },
        {
          label: 'map',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'map<${1:string}, ${2:string}> ${3:field_name} = ${4:1};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a map field',
          range
        },
        {
          label: 'syntax',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'syntax = "${1|proto2,proto3|}";',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Set the protobuf syntax version',
          range
        },
        {
          label: 'import',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'import "${1:filename}.proto";',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Import another proto file',
          range
        },
        {
          label: 'package',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'package ${1:name};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Declare the package namespace',
          range
        },
        {
          label: 'repeated',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'repeated ${1:type} ${2:field_name} = ${3:1};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a repeated (list) field',
          range
        },
        {
          label: 'optional',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'optional ${1:type} ${2:field_name} = ${3:1};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define an optional field',
          range
        },
        {
          label: 'reserved',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'reserved ${1:2, 15, 9 to 11};',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Reserve field numbers or names',
          range
        }
      ];

      const snippetLabels = new Set(snippets.map((s) => s.label));

      const keywordSuggestions = keywords
        .filter((kw) => !snippetLabels.has(kw))
        .map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range
        }));

      const typeSuggestions = typeKeywords.map((t) => ({
        label: t,
        kind: monaco.languages.CompletionItemKind.TypeParameter,
        insertText: t,
        range
      }));

      return {
        suggestions: [...snippets, ...keywordSuggestions, ...typeSuggestions]
      };
    }
  });
}

export { PROTO_LANGUAGE_ID };
