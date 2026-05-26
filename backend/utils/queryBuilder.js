/**
 * Mongoose-style query chain for file-based models
 */

function applyProjection(doc, projection) {
  if (!doc || !projection) return doc;
  const out = { ...doc };

  if (typeof projection === 'string') {
    const fields = projection.split(/\s+/).filter(Boolean);
    const exclude = fields.filter((f) => f.startsWith('-')).map((f) => f.slice(1));
    const include = fields.filter((f) => !f.startsWith('-') && f !== '-password');

    if (include.length > 0 && !include.includes('_id')) {
      const picked = {};
      include.forEach((f) => {
        if (out[f] !== undefined) picked[f] = out[f];
      });
      if (out._id !== undefined) picked._id = out._id;
      return picked;
    }

    exclude.forEach((f) => delete out[f]);
    return out;
  }

  if (typeof projection === 'object') {
    Object.keys(projection).forEach((key) => {
      if (projection[key] === 0) delete out[key];
    });
  }

  delete out.password;
  return out;
}

class QueryBuilder {
  constructor(collection, ModelClass, filter) {
    this.collection = collection;
    this.ModelClass = ModelClass;
    this.filter = filter;
    this.projection = null;
    this.sortSpec = null;
    this.limitN = null;
    this.skipN = 0;
  }

  select(projection) {
    this.projection = projection;
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(n) {
    this.limitN = n;
    return this;
  }

  skip(n) {
    this.skipN = n;
    return this;
  }

  populate() {
    return this;
  }

  async lean() {
    return this.exec();
  }

  async exec() {
    let rows = this.collection.find(this.filter);

    if (this.sortSpec) {
      rows = [...rows].sort((a, b) => {
        for (const [key, order] of Object.entries(this.sortSpec)) {
          const av = a[key];
          const bv = b[key];
          if (av < bv) return order === -1 ? 1 : -1;
          if (av > bv) return order === -1 ? -1 : 1;
        }
        return 0;
      });
    }

    if (this.skipN) rows = rows.slice(this.skipN);
    if (this.limitN) rows = rows.slice(0, this.limitN);

    return rows.map((row) => {
      const json = applyProjection(row, this.projection);
      return this.ModelClass ? new this.ModelClass(json) : json;
    });
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

module.exports = { QueryBuilder, applyProjection };
