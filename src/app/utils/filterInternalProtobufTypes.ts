export const filterInternalProtobufTypes = (schemas: string[]) => {
  const internalProtobufTypes = [
    'org.infinispan.protostream',
    'org.infinispan.persistence',
    'org.infinispan.query',
    'org.infinispan.commons',
    'google',
  ];

  return schemas.filter(
    (schema) => !internalProtobufTypes.some((item) => schema.includes(item))
  );
};
