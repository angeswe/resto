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
      'datetime': () => faker.date.recent().toISOString(),
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
      'object': () => ({ id: uuidv4() }), // Default object if needed
      'array': () => [faker.lorem.word(), faker.lorem.word()], // Default array if needed
    };

    const match = value.match(/^\(random:(\w+)\)$/);
    if (!match) return value;

    const type = match[1];
    const result = randomTypes[type] ? randomTypes[type]() : value;
    
    // Return the raw value without string conversion
    return result;
  }

  private static generateValue(value: SchemaValue): any {
    // If it's a random function string
    if (typeof value === 'string' && value.startsWith('(random:')) {
      const result = this.parseRandomFunction(value);
      // If the result is null/undefined, return a default object
      return result ?? { value: faker.lorem.word() };
    }

    // If it's an array
    if (Array.isArray(value)) {
      return value.map(item => this.generateValue(item));
    }

    // If it's an object (but not null)
    if (typeof value === 'object' && value !== null) {
      return this.generateObject(value as Schema);
    }

    // If it's a string that could be a number or boolean
    if (typeof value === 'string') {
      // Try to parse as number
      const num = Number(value);
      if (!isNaN(num)) {
        return num;
      }
      // Try to parse as boolean
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      
      // Keep as string
      return value;
    }

    // Return primitives as is
    return value;
  }

  private static generateObject(schema: Schema): object {
    // If schema is empty or invalid, return a default object
    if (!schema || typeof schema !== 'object') {
      return { value: faker.lorem.word() };
    }

    const result: { [key: string]: any } = {};

    for (const [key, value] of Object.entries(schema)) {
      const generatedValue = this.generateValue(value);
      // Ensure we never have undefined/null values
      result[key] = generatedValue ?? { value: faker.lorem.word() };
    }

    return result;
  }

  static generate(schema: Schema | string, count: number = 1): object[] {
    try {
      // Parse schema if it's a string
      const parsedSchema = typeof schema === 'string' 
        ? JSON.parse(schema) 
        : schema;

      // Validate parsed schema
      if (!parsedSchema || typeof parsedSchema !== 'object') {
        throw new Error('Invalid schema');
      }

      const results: object[] = [];
      for (let i = 0; i < count; i++) {
        results.push(this.generateObject(parsedSchema));
      }
      return results;
    } catch (error) {
      // Return a default object if schema is invalid
      return Array(count).fill({ value: faker.lorem.word() });
    }
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
