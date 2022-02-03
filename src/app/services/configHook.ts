import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchConfigurationYAML(cacheName: string) {
  const [configuration, setConfiguration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.caches()
        .getConfiguration(cacheName, 'yaml')
        .then((r) => {
          if (r.isRight()) {
            setConfiguration(r.value);
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, configuration };
}

export function useFetchConfigurationXML(cacheName: string) {
  const [configuration, setConfiguration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to format XML configuration
  const formatXml = (xml) => {
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

  useEffect(() => {
    if (loading) {
      ConsoleServices.caches()
        .getConfiguration(cacheName, 'xml')
        .then((r) => {
          if (r.isRight()) {
            setConfiguration(formatXml(r.value));
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, configuration };
}
