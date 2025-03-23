"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataGenerator = void 0;
const uuid_1 = require("uuid");
const faker_1 = require("@faker-js/faker");
class DataGenerator {
    static parseRandomFunction(value) {
        const randomTypes = {
            'uuid': () => (0, uuid_1.v4)(),
            'string': () => faker_1.faker.lorem.word(),
            'name': () => faker_1.faker.person.fullName(),
            'email': () => faker_1.faker.internet.email(),
            'datetime': () => faker_1.faker.date.recent(),
            'date': () => faker_1.faker.date.recent().toISOString().split('T')[0],
            'number': () => faker_1.faker.number.int({ min: 1, max: 1000 }),
            'boolean': () => faker_1.faker.datatype.boolean(),
            'company': () => faker_1.faker.company.name(),
            'address': () => faker_1.faker.location.streetAddress(),
            'phone': () => faker_1.faker.phone.number(),
            'url': () => faker_1.faker.internet.url(),
            'image': () => faker_1.faker.image.url(),
            'paragraph': () => faker_1.faker.lorem.paragraph(),
            'sentences': () => faker_1.faker.lorem.sentences(),
        };
        const match = value.match(/^\(random:(\w+)\)$/);
        if (!match)
            return value;
        const type = match[1];
        return randomTypes[type] ? randomTypes[type]() : value;
    }
    static generateValue(value) {
        if (typeof value === 'string' && value.startsWith('(random:')) {
            return this.parseRandomFunction(value);
        }
        if (Array.isArray(value)) {
            return value.map(item => this.generateValue(item));
        }
        if (typeof value === 'object' && value !== null) {
            return this.generateObject(value);
        }
        return value;
    }
    static generateObject(schema) {
        const result = {};
        for (const [key, value] of Object.entries(schema)) {
            result[key] = this.generateValue(value);
        }
        return result;
    }
    static generate(schema, count = 1) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.generateObject(schema));
        }
        return results;
    }
    static paginate(data, page = 1, limit = 10) {
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
exports.DataGenerator = DataGenerator;
