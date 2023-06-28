/**
 * Utility function to group connections
 * having same "principal", "server-node-name", remote-address and 'client-version'
 * @param connections
 */

export function groupConnections(connections: ConnectedClients[]): ConnectedClients[] {
  const groupedArray: ConnectedClients[] = [];

  // Loop through each connection
  for (const connection of connections) {
    // Find an existing group that matches the connection's criteria
    const foundGroup = groupedArray.find(
      (group) =>
        group['server-node-name'] === connection['server-node-name'] &&
        group.principal === connection.principal &&
        group['remote-address'] === connection['remote-address'] &&
        group['client-version'] === connection['client-version']
    );

    // If a matching group is found, increment the count
    if (foundGroup) {
      foundGroup.count = (foundGroup.count || 0) + 1;
    } else {
      // If no matching group is found, create a new connection with count = 1
      const newConnection = { ...connection, count: 1 };
      groupedArray.push(newConnection);
    }
  }

  return groupedArray;
}
