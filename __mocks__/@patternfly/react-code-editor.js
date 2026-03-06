const React = require('react');

const CodeEditor = (props) => {
  return React.createElement('textarea', {
    'data-testid': props.id,
    value: props.code,
    onChange: (e) => props.onChange && props.onChange(e.target.value),
    'aria-label': props.id
  });
};

const Language = {
  plaintext: 'plaintext'
};

module.exports = { CodeEditor, Language };
