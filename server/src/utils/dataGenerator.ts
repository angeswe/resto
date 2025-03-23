import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

export interface Schema {
  [key: string]: SchemaValue;
}

type SchemaValue = string | number | boolean | Schema | Schema[] | null;

export class DataGenerator {
  private static parseRandomFunction(value: string): any {
    const randomTypes: { [key: string]: () => any } = {
      'uuid': () => uuidv4(),
      'string': () => faker.lorem.word(),
      'name': () => faker.person.fullName(),
      'email': () => faker.internet.email(),
      'datetime': () => faker.date.recent(),
      'date': () => faker.date.recent().toISOString().split('T')[0],
      'number': () => faker.number.int({ min: 1, max: 1000 }),
      'boolean': () => faker.datatype.boolean(),
      'company': () => faker.company.name(),
      'address': () => faker.location.streetAddress(),
      'phone': () => faker.phone.number(),
      'url': () => faker.internet.url(),
      'image': () => faker.image.url(),
      'paragraph': () => faker.lorem.paragraph(),
      'sentences': () => faker.lorem.sentences(),
    };

    const match = value.match(/^\(random:(\w+)\)$/);
    if (!match) return value;

    const type = match[1];
    return randomTypes[type] ? randomTypes[type]() : value;
  }

  private static generateValue(value: SchemaValue): any {
    if (typeof value === 'string' && value.startsWith('(random:')) {
      return this.parseRandomFunction(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.generateValue(item));
    }

    if (typeof value === 'object' && value !== null) {
      return this.generateObject(value as Schema);
    }

    return value;
  }

  private static generateObject(schema: Schema): object {
    const result: { [key: string]: any } = {};
    
    for (const [key, value] of Object.entries(schema)) {
      result[key] = this.generateValue(value);
    }

    return result;
  }

  static generate(schema: Schema, count: number = 1): object[] {
    const results: object[] = [];
    
    for (let i = 0; i < count; i++) {
      results.push(this.generateObject(schema));
    }

    return results;
  }

  static paginate(data: any[], page: number = 1, limit: number = 10): { data: any[], total: number, page: number, totalPages: number } {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data.slice(startIndex, endIndex),
      total,
      page,
      totalPages
    };
  }
}
