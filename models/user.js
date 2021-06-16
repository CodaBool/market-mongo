import Adapters from 'coda-auth/adapters'

export default class User extends Adapters.TypeORM.Models.User.model {
  // You can extend the options in a model but you should not remove the base
  // properties or change the order of the built-in options on the constructor
  constructor(name, email, image, emailVerified) {
    super(name, email, image, emailVerified);
  }
}

export const UserSchemaTypeORM = {
  name: "SomethingCompletelyDifferent",
  target: User,
  columns: {
    ...Adapters.TypeORM.Models.User.schema.columns,
    password: {
      type: "varchar",
      nullable: true,
    },
    customerId: {
      type: "varchar",
      nullable: true,
    },
    admin: {
      type: "boolean",
      default: false,
      nullable: true,
    },
    active: {
      type: "varchar",
      nullable: true,
    },
    verified: {
      type: "boolean",
      default: false,
      nullable: true,
    },
    trust: {
      type: "int",
      nullable: true,
    },
    spent: {
      type: "int",
      nullable: true,
    },
    shipping: {
      type: "jsonb",
      nullable: true,
    }
  },
}