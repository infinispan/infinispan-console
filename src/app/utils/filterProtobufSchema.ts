export const filterSchema = (schemas: string[]) => {
  const invalidSchemas = [
    'org.infinispan.protostream',
    'org.infinispan.persistence',
    'org.infinispan.query',
    'org.infinispan.commons',
    'google',
  ];

  return schemas.filter(
    (schema) => !invalidSchemas.some((item) => schema.includes(item))
  );
};
