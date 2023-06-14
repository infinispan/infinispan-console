// Function to format XML configuration
export const formatXml = (xml) => {
  let formatted = '';
  let indent = '';
  const tab = '\t';
  xml.split(/>\s*</).forEach(function (node) {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length); // decrease indent by one 'tab'
    formatted += indent + '<' + node + '>\r\n';
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab; // increase indent
  });
  return formatted.substring(1, formatted.length - 3);
};
