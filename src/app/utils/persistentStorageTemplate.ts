export const fileStore = `{
  "file-store": {
    "data": {
      "path": "data"
    },
    "index": {
      "path": "index"
    }
  }
}`;

export const remoteStore = `{
  "remote-store": {
    "cache": "mycache",
    "remote-server": [
      {
        "host": "127.0.0.1",
        "port": "11222"
      }
    ]
  }
}`;

export const tableSqlStore = `{
  "table-jdbc-store": {
    "dialect": "H2",
    "shared": "true",
    "table-name": "books",
    "connection-pool": {
      "connection-url": "jdbc:h2:mem:infinispan",
      "driver": "org.h2.Driver",
      "username": "sa",
      "password": "changeme"
    }
  }
}`;

export const querySqlStore = `{
  "query-jdbc-store": {
    "dialect": "POSTGRES",
    "shared": "true",
    "key-columns": "name",
    "queries": {
      "select-single": "SELECT t1.name, t2.city FROM Person t1 JOIN Address t2 ON t1.name = t2.name WHERE t1.name = :name",
      "select-all": "SELECT t1.name, t2.city FROM Person t1 JOIN Address t2 ON t1.name = t2.name",
      "delete-single": "DELETE FROM Person t1 WHERE t1.name = :name; DELETE FROM Address t2 where t2.name = :name",
      "delete-all": "DELETE FROM Person; DELETE FROM Address",
      "upsert": "INSERT INTO Person (name,  picture, sex, birthdate, accepted_tos) VALUES (:name, :picture, :sex, :birthdate, :accepted_tos); INSERT INTO Address(name, street, city, zip) VALUES (:name, :street, :city, :zip)",
      "size": "SELECT COUNT(*) FROM Person"
    },
    "schema": {
      "message-name": "Person",
      "package": "com.example",
      "embedded-key": "true"
    }
  }
}`;

export const jdbcStore = `{
  "string-keyed-jdbc-store": {
    "dialect": "H2",
    "string-keyed-table": {
      "prefix": "ISPN_STRING_TABLE",
      "create-on-start": true,
      "id-column": {
        "name": "ID_COLUMN",
        "type": "VARCHAR(255)"
      },
      "data-column": {
        "name": "DATA_COLUMN",
        "type": "BINARY"
      },
      "timestamp-column": {
        "name": "TIMESTAMP_COLUMN",
        "type": "BIGINT"
      },
      "segment-column": {
        "name": "SEGMENT_COLUMN",
        "type": "INT"
      }
    },
    "connection-pool": {
      "connection-url": "jdbc:h2:mem:infinispan",
      "driver": "org.h2.Driver",
      "username": "sa",
      "password": "changeme"
    }
  }
}`;

export const rocksDB = `{
  "rocksdb-store":
    {
      "path": "rocksdb/data",
      "expiration": {
        "path": "rocksdb/expired"
      }
  }
}`;
