// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i = array3.length - 1; i >= 0; --i) {
      t = new NonEmpty(array3[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  atLeastLength(desired) {
    let current = this;
    while (desired-- > 0 && current) current = current.tail;
    return current !== void 0;
  }
  hasLength(desired) {
    let current = this;
    while (desired-- > 0 && current) current = current.tail;
    return desired === -1 && current instanceof Empty;
  }
  countLength() {
    let current = this;
    let length2 = 0;
    while (current) {
      current = current.tail;
      length2++;
    }
    return length2 - 1;
  }
};
function prepend(element4, tail) {
  return new NonEmpty(element4, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head: head2, tail } = this.#current;
      this.#current = tail;
      return { value: head2, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head2, tail) {
    super();
    this.head = head2;
    this.tail = tail;
  }
};
var BitArray = class {
  /**
   * The size in bits of this bit array's data.
   *
   * @type {number}
   */
  bitSize;
  /**
   * The size in bytes of this bit array's data. If this bit array doesn't store
   * a whole number of bytes then this value is rounded up.
   *
   * @type {number}
   */
  byteSize;
  /**
   * The number of unused high bits in the first byte of this bit array's
   * buffer prior to the start of its data. The value of any unused high bits is
   * undefined.
   *
   * The bit offset will be in the range 0-7.
   *
   * @type {number}
   */
  bitOffset;
  /**
   * The raw bytes that hold this bit array's data.
   *
   * If `bitOffset` is not zero then there are unused high bits in the first
   * byte of this buffer.
   *
   * If `bitOffset + bitSize` is not a multiple of 8 then there are unused low
   * bits in the last byte of this buffer.
   *
   * @type {Uint8Array}
   */
  rawBuffer;
  /**
   * Constructs a new bit array from a `Uint8Array`, an optional size in
   * bits, and an optional bit offset.
   *
   * If no bit size is specified it is taken as `buffer.length * 8`, i.e. all
   * bytes in the buffer make up the new bit array's data.
   *
   * If no bit offset is specified it defaults to zero, i.e. there are no unused
   * high bits in the first byte of the buffer.
   *
   * @param {Uint8Array} buffer
   * @param {number} [bitSize]
   * @param {number} [bitOffset]
   */
  constructor(buffer, bitSize, bitOffset) {
    if (!(buffer instanceof Uint8Array)) {
      throw globalThis.Error(
        "BitArray can only be constructed from a Uint8Array"
      );
    }
    this.bitSize = bitSize ?? buffer.length * 8;
    this.byteSize = Math.trunc((this.bitSize + 7) / 8);
    this.bitOffset = bitOffset ?? 0;
    if (this.bitSize < 0) {
      throw globalThis.Error(`BitArray bit size is invalid: ${this.bitSize}`);
    }
    if (this.bitOffset < 0 || this.bitOffset > 7) {
      throw globalThis.Error(
        `BitArray bit offset is invalid: ${this.bitOffset}`
      );
    }
    if (buffer.length !== Math.trunc((this.bitOffset + this.bitSize + 7) / 8)) {
      throw globalThis.Error("BitArray buffer length is invalid");
    }
    this.rawBuffer = buffer;
  }
  /**
   * Returns a specific byte in this bit array. If the byte index is out of
   * range then `undefined` is returned.
   *
   * When returning the final byte of a bit array with a bit size that's not a
   * multiple of 8, the content of the unused low bits are undefined.
   *
   * @param {number} index
   * @returns {number | undefined}
   */
  byteAt(index4) {
    if (index4 < 0 || index4 >= this.byteSize) {
      return void 0;
    }
    return bitArrayByteAt(this.rawBuffer, this.bitOffset, index4);
  }
  equals(other) {
    if (this.bitSize !== other.bitSize) {
      return false;
    }
    const wholeByteCount = Math.trunc(this.bitSize / 8);
    if (this.bitOffset === 0 && other.bitOffset === 0) {
      for (let i = 0; i < wholeByteCount; i++) {
        if (this.rawBuffer[i] !== other.rawBuffer[i]) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (this.rawBuffer[wholeByteCount] >> unusedLowBitCount !== other.rawBuffer[wholeByteCount] >> unusedLowBitCount) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < wholeByteCount; i++) {
        const a2 = bitArrayByteAt(this.rawBuffer, this.bitOffset, i);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, i);
        if (a2 !== b) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const a2 = bitArrayByteAt(
          this.rawBuffer,
          this.bitOffset,
          wholeByteCount
        );
        const b = bitArrayByteAt(
          other.rawBuffer,
          other.bitOffset,
          wholeByteCount
        );
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (a2 >> unusedLowBitCount !== b >> unusedLowBitCount) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Returns this bit array's internal buffer.
   *
   * @deprecated Use `BitArray.byteAt()` or `BitArray.rawBuffer` instead.
   *
   * @returns {Uint8Array}
   */
  get buffer() {
    bitArrayPrintDeprecationWarning(
      "buffer",
      "Use BitArray.byteAt() or BitArray.rawBuffer instead"
    );
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error(
        "BitArray.buffer does not support unaligned bit arrays"
      );
    }
    return this.rawBuffer;
  }
  /**
   * Returns the length in bytes of this bit array's internal buffer.
   *
   * @deprecated Use `BitArray.bitSize` or `BitArray.byteSize` instead.
   *
   * @returns {number}
   */
  get length() {
    bitArrayPrintDeprecationWarning(
      "length",
      "Use BitArray.bitSize or BitArray.byteSize instead"
    );
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error(
        "BitArray.length does not support unaligned bit arrays"
      );
    }
    return this.rawBuffer.length;
  }
};
function bitArrayByteAt(buffer, bitOffset, index4) {
  if (bitOffset === 0) {
    return buffer[index4] ?? 0;
  } else {
    const a2 = buffer[index4] << bitOffset & 255;
    const b = buffer[index4 + 1] >> 8 - bitOffset;
    return a2 | b;
  }
}
var UtfCodepoint = class {
  constructor(value) {
    this.value = value;
  }
};
var isBitArrayDeprecationMessagePrinted = {};
function bitArrayPrintDeprecationWarning(name2, message) {
  if (isBitArrayDeprecationMessagePrinted[name2]) {
    return;
  }
  console.warn(
    `Deprecated BitArray.${name2} property used in JavaScript FFI code. ${message}.`
  );
  isBitArrayDeprecationMessagePrinted[name2] = true;
}
var Result = class _Result extends CustomType {
  static isResult(data2) {
    return data2 instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values3 = [x, y];
  while (values3.length) {
    let a2 = values3.pop();
    let b = values3.pop();
    if (a2 === b) continue;
    if (!isObject(a2) || !isObject(b)) return false;
    let unequal = !structurallyCompatibleObjects(a2, b) || unequalDates(a2, b) || unequalBuffers(a2, b) || unequalArrays(a2, b) || unequalMaps(a2, b) || unequalSets(a2, b) || unequalRegExps(a2, b);
    if (unequal) return false;
    const proto = Object.getPrototypeOf(a2);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a2.equals(b)) continue;
        else return false;
      } catch {
      }
    }
    let [keys2, get2] = getters(a2);
    const ka = keys2(a2);
    const kb = keys2(b);
    if (ka.length !== kb.length) return false;
    for (let k of ka) {
      values3.push(get2(a2, k), get2(b, k));
    }
  }
  return true;
}
function getters(object4) {
  if (object4 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object4 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a2, b) {
  return a2 instanceof Date && (a2 > b || a2 < b);
}
function unequalBuffers(a2, b) {
  return !(a2 instanceof BitArray) && a2.buffer instanceof ArrayBuffer && a2.BYTES_PER_ELEMENT && !(a2.byteLength === b.byteLength && a2.every((n, i) => n === b[i]));
}
function unequalArrays(a2, b) {
  return Array.isArray(a2) && a2.length !== b.length;
}
function unequalMaps(a2, b) {
  return a2 instanceof Map && a2.size !== b.size;
}
function unequalSets(a2, b) {
  return a2 instanceof Set && (a2.size != b.size || [...a2].some((e) => !b.has(e)));
}
function unequalRegExps(a2, b) {
  return a2 instanceof RegExp && (a2.source !== b.source || a2.flags !== b.flags);
}
function isObject(a2) {
  return typeof a2 === "object" && a2 !== null;
}
function structurallyCompatibleObjects(a2, b) {
  if (typeof a2 !== "object" && typeof b !== "object" && (!a2 || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a2 instanceof c)) return false;
  return a2.constructor === b.constructor;
}
function remainderInt(a2, b) {
  if (b === 0) {
    return 0;
  } else {
    return a2 % b;
  }
}
function divideInt(a2, b) {
  return Math.trunc(divideFloat(a2, b));
}
function divideFloat(a2, b) {
  if (b === 0) {
    return 0;
  } else {
    return a2 / b;
  }
}
function makeError(variant, file, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.file = file;
  error.module = module;
  error.line = line;
  error.function = fn;
  error.fn = fn;
  for (let k in extra) error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var None = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = /* @__PURE__ */ new DataView(
  /* @__PURE__ */ new ArrayBuffer(8)
);
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a2, b) {
  return a2 ^ b + 2654435769 + (a2 << 6) + (a2 >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys2 = Object.keys(o);
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null) return 1108378658;
  if (u === void 0) return 1108378659;
  if (u === true) return 1108378657;
  if (u === false) return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at] = val;
  return out;
}
function spliceIn(arr, at, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root9, shift, hash, key, val, addedLeaf) {
  switch (root9.type) {
    case ARRAY_NODE:
      return assocArray(root9, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root9, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root9, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root9, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node2 = root9.array[idx];
  if (node2 === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root9.size + 1,
      array: cloneAndSet(root9.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node2.type === ENTRY) {
    if (isEqual(key, node2.k)) {
      if (val === node2.v) {
        return root9;
      }
      return {
        type: ARRAY_NODE,
        size: root9.size,
        array: cloneAndSet(root9.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root9.size,
      array: cloneAndSet(
        root9.array,
        idx,
        createNode(shift + SHIFT, node2.k, node2.v, hash, key, val)
      )
    };
  }
  const n = assoc(node2, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node2) {
    return root9;
  }
  return {
    type: ARRAY_NODE,
    size: root9.size,
    array: cloneAndSet(root9.array, idx, n)
  };
}
function assocIndex(root9, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root9.bitmap, bit);
  if ((root9.bitmap & bit) !== 0) {
    const node2 = root9.array[idx];
    if (node2.type !== ENTRY) {
      const n = assoc(node2, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node2) {
        return root9;
      }
      return {
        type: INDEX_NODE,
        bitmap: root9.bitmap,
        array: cloneAndSet(root9.array, idx, n)
      };
    }
    const nodeKey = node2.k;
    if (isEqual(key, nodeKey)) {
      if (val === node2.v) {
        return root9;
      }
      return {
        type: INDEX_NODE,
        bitmap: root9.bitmap,
        array: cloneAndSet(root9.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root9.bitmap,
      array: cloneAndSet(
        root9.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node2.v, hash, key, val)
      )
    };
  } else {
    const n = root9.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes2 = new Array(32);
      const jdx = mask(hash, shift);
      nodes2[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root9.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node2 = root9.array[j++];
          nodes2[i] = node2;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes2
      };
    } else {
      const newArray = spliceIn(root9.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root9.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root9, shift, hash, key, val, addedLeaf) {
  if (hash === root9.hash) {
    const idx = collisionIndexOf(root9, key);
    if (idx !== -1) {
      const entry = root9.array[idx];
      if (entry.v === val) {
        return root9;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root9.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size2 = root9.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root9.array, size2, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root9.hash, shift),
      array: [root9]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root9, key) {
  const size2 = root9.array.length;
  for (let i = 0; i < size2; i++) {
    if (isEqual(key, root9.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root9, shift, hash, key) {
  switch (root9.type) {
    case ARRAY_NODE:
      return findArray(root9, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root9, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root9, key);
  }
}
function findArray(root9, shift, hash, key) {
  const idx = mask(hash, shift);
  const node2 = root9.array[idx];
  if (node2 === void 0) {
    return void 0;
  }
  if (node2.type !== ENTRY) {
    return find(node2, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node2.k)) {
    return node2;
  }
  return void 0;
}
function findIndex(root9, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root9.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root9.bitmap, bit);
  const node2 = root9.array[idx];
  if (node2.type !== ENTRY) {
    return find(node2, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node2.k)) {
    return node2;
  }
  return void 0;
}
function findCollision(root9, key) {
  const idx = collisionIndexOf(root9, key);
  if (idx < 0) {
    return void 0;
  }
  return root9.array[idx];
}
function without(root9, shift, hash, key) {
  switch (root9.type) {
    case ARRAY_NODE:
      return withoutArray(root9, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root9, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root9, key);
  }
}
function withoutArray(root9, shift, hash, key) {
  const idx = mask(hash, shift);
  const node2 = root9.array[idx];
  if (node2 === void 0) {
    return root9;
  }
  let n = void 0;
  if (node2.type === ENTRY) {
    if (!isEqual(node2.k, key)) {
      return root9;
    }
  } else {
    n = without(node2, shift + SHIFT, hash, key);
    if (n === node2) {
      return root9;
    }
  }
  if (n === void 0) {
    if (root9.size <= MIN_ARRAY_NODE) {
      const arr = root9.array;
      const out = new Array(root9.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root9.size - 1,
      array: cloneAndSet(root9.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root9.size,
    array: cloneAndSet(root9.array, idx, n)
  };
}
function withoutIndex(root9, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root9.bitmap & bit) === 0) {
    return root9;
  }
  const idx = index(root9.bitmap, bit);
  const node2 = root9.array[idx];
  if (node2.type !== ENTRY) {
    const n = without(node2, shift + SHIFT, hash, key);
    if (n === node2) {
      return root9;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root9.bitmap,
        array: cloneAndSet(root9.array, idx, n)
      };
    }
    if (root9.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root9.bitmap ^ bit,
      array: spliceOut(root9.array, idx)
    };
  }
  if (isEqual(key, node2.k)) {
    if (root9.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root9.bitmap ^ bit,
      array: spliceOut(root9.array, idx)
    };
  }
  return root9;
}
function withoutCollision(root9, key) {
  const idx = collisionIndexOf(root9, key);
  if (idx < 0) {
    return root9;
  }
  if (root9.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root9.hash,
    array: spliceOut(root9.array, idx)
  };
}
function forEach(root9, fn) {
  if (root9 === void 0) {
    return;
  }
  const items = root9.array;
  const size2 = items.length;
  for (let i = 0; i < size2; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys2 = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root9, size2) {
    this.root = root9;
    this.size = size2;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root9 = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root9, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    try {
      this.forEach((v, k) => {
        if (!isEqual(o.get(k, !v), v)) {
          throw unequalDictSymbol;
        }
      });
      return true;
    } catch (e) {
      if (e === unequalDictSymbol) {
        return false;
      }
      throw e;
    }
  }
};
var unequalDictSymbol = /* @__PURE__ */ Symbol();

// build/dev/javascript/gleam_stdlib/gleam/order.mjs
var Lt = class extends CustomType {
};
var Eq = class extends CustomType {
};
var Gt = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/gleam/float.mjs
function max(a2, b) {
  let $ = a2 > b;
  if ($) {
    return a2;
  } else {
    return b;
  }
}
function absolute_value(x) {
  let $ = x >= 0;
  if ($) {
    return x;
  } else {
    return 0 - x;
  }
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function slice(string5, idx, len) {
  let $ = len <= 0;
  if ($) {
    return "";
  } else {
    let $1 = idx < 0;
    if ($1) {
      let translated_idx = string_length(string5) + idx;
      let $2 = translated_idx < 0;
      if ($2) {
        return "";
      } else {
        return string_slice(string5, translated_idx, len);
      }
    } else {
      return string_slice(string5, idx, len);
    }
  }
}
function concat_loop(loop$strings, loop$accumulator) {
  while (true) {
    let strings = loop$strings;
    let accumulator = loop$accumulator;
    if (strings instanceof Empty) {
      return accumulator;
    } else {
      let string5 = strings.head;
      let strings$1 = strings.tail;
      loop$strings = strings$1;
      loop$accumulator = accumulator + string5;
    }
  }
}
function concat2(strings) {
  return concat_loop(strings, "");
}
function repeat_loop(loop$times, loop$doubling_acc, loop$acc) {
  while (true) {
    let times = loop$times;
    let doubling_acc = loop$doubling_acc;
    let acc = loop$acc;
    let _block;
    let $ = times % 2;
    if ($ === 0) {
      _block = acc;
    } else {
      _block = acc + doubling_acc;
    }
    let acc$1 = _block;
    let times$1 = globalThis.Math.trunc(times / 2);
    let $1 = times$1 <= 0;
    if ($1) {
      return acc$1;
    } else {
      loop$times = times$1;
      loop$doubling_acc = doubling_acc + doubling_acc;
      loop$acc = acc$1;
    }
  }
}
function repeat(string5, times) {
  let $ = times <= 0;
  if ($) {
    return "";
  } else {
    return repeat_loop(times, string5, "");
  }
}
function padding(size2, pad_string) {
  let pad_string_length = string_length(pad_string);
  let num_pads = divideInt(size2, pad_string_length);
  let extra = remainderInt(size2, pad_string_length);
  return repeat(pad_string, num_pads) + slice(pad_string, 0, extra);
}
function pad_start(string5, desired_length, pad_string) {
  let current_length = string_length(string5);
  let to_pad_length = desired_length - current_length;
  let $ = to_pad_length <= 0;
  if ($) {
    return string5;
  } else {
    return padding(to_pad_length, pad_string) + string5;
  }
}
function trim(string5) {
  let _pipe = string5;
  let _pipe$1 = trim_start(_pipe);
  return trim_end(_pipe$1);
}
function split2(x, substring) {
  if (substring === "") {
    return graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = identity(_pipe);
    let _pipe$2 = split(_pipe$1, substring);
    return map(_pipe$2, identity);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic/decode.mjs
var DecodeError = class extends CustomType {
  constructor(expected, found, path2) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path2;
  }
};
var Decoder = class extends CustomType {
  constructor(function$) {
    super();
    this.function = function$;
  }
};
function run(data2, decoder3) {
  let $ = decoder3.function(data2);
  let maybe_invalid_data;
  let errors;
  maybe_invalid_data = $[0];
  errors = $[1];
  if (errors instanceof Empty) {
    return new Ok(maybe_invalid_data);
  } else {
    return new Error(errors);
  }
}
function success(data2) {
  return new Decoder((_) => {
    return [data2, toList([])];
  });
}
function map2(decoder3, transformer) {
  return new Decoder(
    (d) => {
      let $ = decoder3.function(d);
      let data2;
      let errors;
      data2 = $[0];
      errors = $[1];
      return [transformer(data2), errors];
    }
  );
}
function then$(decoder3, next) {
  return new Decoder(
    (dynamic_data) => {
      let $ = decoder3.function(dynamic_data);
      let data2;
      let errors;
      data2 = $[0];
      errors = $[1];
      let decoder$1 = next(data2);
      let $1 = decoder$1.function(dynamic_data);
      let layer;
      let data$1;
      layer = $1;
      data$1 = $1[0];
      if (errors instanceof Empty) {
        return layer;
      } else {
        return [data$1, errors];
      }
    }
  );
}
function run_decoders(loop$data, loop$failure, loop$decoders) {
  while (true) {
    let data2 = loop$data;
    let failure2 = loop$failure;
    let decoders = loop$decoders;
    if (decoders instanceof Empty) {
      return failure2;
    } else {
      let decoder3 = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder3.function(data2);
      let layer;
      let errors;
      layer = $;
      errors = $[1];
      if (errors instanceof Empty) {
        return layer;
      } else {
        loop$data = data2;
        loop$failure = failure2;
        loop$decoders = decoders$1;
      }
    }
  }
}
function one_of(first, alternatives) {
  return new Decoder(
    (dynamic_data) => {
      let $ = first.function(dynamic_data);
      let layer;
      let errors;
      layer = $;
      errors = $[1];
      if (errors instanceof Empty) {
        return layer;
      } else {
        return run_decoders(dynamic_data, layer, alternatives);
      }
    }
  );
}
function optional(inner) {
  return new Decoder(
    (data2) => {
      let $ = is_null(data2);
      if ($) {
        return [new None(), toList([])];
      } else {
        let $1 = inner.function(data2);
        let data$1;
        let errors;
        data$1 = $1[0];
        errors = $1[1];
        return [new Some(data$1), errors];
      }
    }
  );
}
function decode_error(expected, found) {
  return toList([
    new DecodeError(expected, classify_dynamic(found), toList([]))
  ]);
}
function run_dynamic_function(data2, name2, f) {
  let $ = f(data2);
  if ($ instanceof Ok) {
    let data$1 = $[0];
    return [data$1, toList([])];
  } else {
    let zero = $[0];
    return [
      zero,
      toList([new DecodeError(name2, classify_dynamic(data2), toList([]))])
    ];
  }
}
function decode_int(data2) {
  return run_dynamic_function(data2, "Int", int);
}
function decode_float(data2) {
  return run_dynamic_function(data2, "Float", float);
}
function failure(zero, expected) {
  return new Decoder((d) => {
    return [zero, decode_error(expected, d)];
  });
}
function new_primitive_decoder(name2, decoding_function) {
  return new Decoder(
    (d) => {
      let $ = decoding_function(d);
      if ($ instanceof Ok) {
        let t = $[0];
        return [t, toList([])];
      } else {
        let zero = $[0];
        return [
          zero,
          toList([new DecodeError(name2, classify_dynamic(d), toList([]))])
        ];
      }
    }
  );
}
var int2 = /* @__PURE__ */ new Decoder(decode_int);
var float2 = /* @__PURE__ */ new Decoder(decode_float);
function decode_string(data2) {
  return run_dynamic_function(data2, "String", string);
}
var string2 = /* @__PURE__ */ new Decoder(decode_string);
function fold_dict(acc, key, value, key_decoder, value_decoder) {
  let $ = key_decoder(key);
  let $1 = $[1];
  if ($1 instanceof Empty) {
    let key$1 = $[0];
    let $2 = value_decoder(value);
    let $3 = $2[1];
    if ($3 instanceof Empty) {
      let value$1 = $2[0];
      let dict$1 = insert(acc[0], key$1, value$1);
      return [dict$1, acc[1]];
    } else {
      let errors = $3;
      return push_path([new_map(), errors], toList(["values"]));
    }
  } else {
    let errors = $1;
    return push_path([new_map(), errors], toList(["keys"]));
  }
}
function dict2(key, value) {
  return new Decoder(
    (data2) => {
      let $ = dict(data2);
      if ($ instanceof Ok) {
        let dict$1 = $[0];
        return fold(
          dict$1,
          [new_map(), toList([])],
          (a2, k, v) => {
            let $1 = a2[1];
            if ($1 instanceof Empty) {
              return fold_dict(a2, k, v, key.function, value.function);
            } else {
              return a2;
            }
          }
        );
      } else {
        return [new_map(), decode_error("Dict", data2)];
      }
    }
  );
}
function push_path(layer, path2) {
  let decoder3 = one_of(
    string2,
    toList([
      (() => {
        let _pipe = int2;
        return map2(_pipe, to_string);
      })()
    ])
  );
  let path$1 = map(
    path2,
    (key) => {
      let key$1 = identity(key);
      let $ = run(key$1, decoder3);
      if ($ instanceof Ok) {
        let key$2 = $[0];
        return key$2;
      } else {
        return "<" + classify_dynamic(key$1) + ">";
      }
    }
  );
  let errors = map(
    layer[1],
    (error) => {
      return new DecodeError(
        error.expected,
        error.found,
        append2(path$1, error.path)
      );
    }
  );
  return [layer[0], errors];
}
function index3(loop$path, loop$position, loop$inner, loop$data, loop$handle_miss) {
  while (true) {
    let path2 = loop$path;
    let position2 = loop$position;
    let inner = loop$inner;
    let data2 = loop$data;
    let handle_miss = loop$handle_miss;
    if (path2 instanceof Empty) {
      let _pipe = inner(data2);
      return push_path(_pipe, reverse(position2));
    } else {
      let key = path2.head;
      let path$1 = path2.tail;
      let $ = index2(data2, key);
      if ($ instanceof Ok) {
        let $1 = $[0];
        if ($1 instanceof Some) {
          let data$1 = $1[0];
          loop$path = path$1;
          loop$position = prepend(key, position2);
          loop$inner = inner;
          loop$data = data$1;
          loop$handle_miss = handle_miss;
        } else {
          return handle_miss(data2, prepend(key, position2));
        }
      } else {
        let kind = $[0];
        let $1 = inner(data2);
        let default$;
        default$ = $1[0];
        let _pipe = [
          default$,
          toList([new DecodeError(kind, classify_dynamic(data2), toList([]))])
        ];
        return push_path(_pipe, reverse(position2));
      }
    }
  }
}
function subfield(field_path, field_decoder, next) {
  return new Decoder(
    (data2) => {
      let $ = index3(
        field_path,
        toList([]),
        field_decoder.function,
        data2,
        (data3, position2) => {
          let $12 = field_decoder.function(data3);
          let default$;
          default$ = $12[0];
          let _pipe = [
            default$,
            toList([new DecodeError("Field", "Nothing", toList([]))])
          ];
          return push_path(_pipe, reverse(position2));
        }
      );
      let out;
      let errors1;
      out = $[0];
      errors1 = $[1];
      let $1 = next(out).function(data2);
      let out$1;
      let errors2;
      out$1 = $1[0];
      errors2 = $1[1];
      return [out$1, append2(errors1, errors2)];
    }
  );
}
function field(field_name, field_decoder, next) {
  return subfield(toList([field_name]), field_decoder, next);
}

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x) {
  return x;
}
function parse_int(value) {
  if (/^[-+]?(\d+)$/.test(value)) {
    return new Ok(parseInt(value));
  } else {
    return new Error(Nil);
  }
}
function parse_float(value) {
  if (/^[-+]?(\d+)\.(\d+)([eE][-+]?\d+)?$/.test(value)) {
    return new Ok(parseFloat(value));
  } else {
    return new Error(Nil);
  }
}
function to_string(term) {
  return term.toString();
}
function string_length(string5) {
  if (string5 === "") {
    return 0;
  }
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    let i = 0;
    for (const _ of iterator) {
      i++;
    }
    return i;
  } else {
    return string5.match(/./gsu).length;
  }
}
function graphemes(string5) {
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    return List.fromArray(Array.from(iterator).map((item) => item.segment));
  } else {
    return List.fromArray(string5.match(/./gsu));
  }
}
var segmenter = void 0;
function graphemes_iterator(string5) {
  if (globalThis.Intl && Intl.Segmenter) {
    segmenter ||= new Intl.Segmenter();
    return segmenter.segment(string5)[Symbol.iterator]();
  }
}
function split(xs, pattern3) {
  return List.fromArray(xs.split(pattern3));
}
function string_slice(string5, idx, len) {
  if (len <= 0 || idx >= string5.length) {
    return "";
  }
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    while (idx-- > 0) {
      iterator.next();
    }
    let result = "";
    while (len-- > 0) {
      const v = iterator.next().value;
      if (v === void 0) {
        break;
      }
      result += v.segment;
    }
    return result;
  } else {
    return string5.match(/./gsu).slice(idx, idx + len).join("");
  }
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join("");
var trim_start_regex = /* @__PURE__ */ new RegExp(
  `^[${unicode_whitespaces}]*`
);
var trim_end_regex = /* @__PURE__ */ new RegExp(`[${unicode_whitespaces}]*$`);
function trim_start(string5) {
  return string5.replace(trim_start_regex, "");
}
function trim_end(string5) {
  return string5.replace(trim_end_regex, "");
}
function new_map() {
  return Dict.new();
}
function map_to_list(map4) {
  return List.fromArray(map4.entries());
}
function map_remove(key, map4) {
  return map4.delete(key);
}
function map_get(map4, key) {
  const value = map4.get(key, NOT_FOUND);
  if (value === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value);
}
function map_insert(key, value, map4) {
  return map4.set(key, value);
}
function classify_dynamic(data2) {
  if (typeof data2 === "string") {
    return "String";
  } else if (typeof data2 === "boolean") {
    return "Bool";
  } else if (data2 instanceof Result) {
    return "Result";
  } else if (data2 instanceof List) {
    return "List";
  } else if (data2 instanceof BitArray) {
    return "BitArray";
  } else if (data2 instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data2)) {
    return "Int";
  } else if (Array.isArray(data2)) {
    return `Array`;
  } else if (typeof data2 === "number") {
    return "Float";
  } else if (data2 === null) {
    return "Nil";
  } else if (data2 === void 0) {
    return "Nil";
  } else {
    const type = typeof data2;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function float_to_string(float4) {
  const string5 = float4.toString().replace("+", "");
  if (string5.indexOf(".") >= 0) {
    return string5;
  } else {
    const index4 = string5.indexOf("e");
    if (index4 >= 0) {
      return string5.slice(0, index4) + ".0" + string5.slice(index4);
    } else {
      return string5 + ".0";
    }
  }
}
function index2(data2, key) {
  if (data2 instanceof Dict || data2 instanceof WeakMap || data2 instanceof Map) {
    const token = {};
    const entry = data2.get(key, token);
    if (entry === token) return new Ok(new None());
    return new Ok(new Some(entry));
  }
  const key_is_int = Number.isInteger(key);
  if (key_is_int && key >= 0 && key < 8 && data2 instanceof List) {
    let i = 0;
    for (const value of data2) {
      if (i === key) return new Ok(new Some(value));
      i++;
    }
    return new Error("Indexable");
  }
  if (key_is_int && Array.isArray(data2) || data2 && typeof data2 === "object" || data2 && Object.getPrototypeOf(data2) === Object.prototype) {
    if (key in data2) return new Ok(new Some(data2[key]));
    return new Ok(new None());
  }
  return new Error(key_is_int ? "Indexable" : "Dict");
}
function dict(data2) {
  if (data2 instanceof Dict) {
    return new Ok(data2);
  }
  if (data2 instanceof Map || data2 instanceof WeakMap) {
    return new Ok(Dict.fromMap(data2));
  }
  if (data2 == null) {
    return new Error("Dict");
  }
  if (typeof data2 !== "object") {
    return new Error("Dict");
  }
  const proto = Object.getPrototypeOf(data2);
  if (proto === Object.prototype || proto === null) {
    return new Ok(Dict.fromObject(data2));
  }
  return new Error("Dict");
}
function float(data2) {
  if (typeof data2 === "number") return new Ok(data2);
  return new Error(0);
}
function int(data2) {
  if (Number.isInteger(data2)) return new Ok(data2);
  return new Error(0);
}
function string(data2) {
  if (typeof data2 === "string") return new Ok(data2);
  return new Error("");
}
function is_null(data2) {
  return data2 === null || data2 === void 0;
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function insert(dict4, key, value) {
  return map_insert(key, value, dict4);
}
function from_list_loop(loop$list, loop$initial) {
  while (true) {
    let list4 = loop$list;
    let initial = loop$initial;
    if (list4 instanceof Empty) {
      return initial;
    } else {
      let rest = list4.tail;
      let key = list4.head[0];
      let value = list4.head[1];
      loop$list = rest;
      loop$initial = insert(initial, key, value);
    }
  }
}
function from_list(list4) {
  return from_list_loop(list4, new_map());
}
function delete$(dict4, key) {
  return map_remove(key, dict4);
}
function fold_loop(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list4 = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list4 instanceof Empty) {
      return initial;
    } else {
      let rest = list4.tail;
      let k = list4.head[0];
      let v = list4.head[1];
      loop$list = rest;
      loop$initial = fun(initial, k, v);
      loop$fun = fun;
    }
  }
}
function fold(dict4, initial, fun) {
  return fold_loop(map_to_list(dict4), initial, fun);
}
function do_map_values(f, dict4) {
  let f$1 = (dict5, k, v) => {
    return insert(dict5, k, f(k, v));
  };
  return fold(dict4, new_map(), f$1);
}
function map_values(dict4, fun) {
  return do_map_values(fun, dict4);
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
var Ascending = class extends CustomType {
};
var Descending = class extends CustomType {
};
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix instanceof Empty) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function reverse(list4) {
  return reverse_and_prepend(list4, toList([]));
}
function contains(loop$list, loop$elem) {
  while (true) {
    let list4 = loop$list;
    let elem = loop$elem;
    if (list4 instanceof Empty) {
      return false;
    } else {
      let first$1 = list4.head;
      if (isEqual(first$1, elem)) {
        return true;
      } else {
        let rest$1 = list4.tail;
        loop$list = rest$1;
        loop$elem = elem;
      }
    }
  }
}
function filter_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list4 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      let _block;
      let $ = fun(first$1);
      if ($) {
        _block = prepend(first$1, acc);
      } else {
        _block = acc;
      }
      let new_acc = _block;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list4, predicate) {
  return filter_loop(list4, predicate, toList([]));
}
function filter_map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list4 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      let _block;
      let $ = fun(first$1);
      if ($ instanceof Ok) {
        let first$2 = $[0];
        _block = prepend(first$2, acc);
      } else {
        _block = acc;
      }
      let new_acc = _block;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter_map(list4, fun) {
  return filter_map_loop(list4, fun, toList([]));
}
function map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list4 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = prepend(fun(first$1), acc);
    }
  }
}
function map(list4, fun) {
  return map_loop(list4, fun, toList([]));
}
function append_loop(loop$first, loop$second) {
  while (true) {
    let first = loop$first;
    let second = loop$second;
    if (first instanceof Empty) {
      return second;
    } else {
      let first$1 = first.head;
      let rest$1 = first.tail;
      loop$first = rest$1;
      loop$second = prepend(first$1, second);
    }
  }
}
function append2(first, second) {
  return append_loop(reverse(first), second);
}
function prepend2(list4, item) {
  return prepend(item, list4);
}
function fold2(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list4 = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list4 instanceof Empty) {
      return initial;
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, first$1);
      loop$fun = fun;
    }
  }
}
function find2(loop$list, loop$is_desired) {
  while (true) {
    let list4 = loop$list;
    let is_desired = loop$is_desired;
    if (list4 instanceof Empty) {
      return new Error(void 0);
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      let $ = is_desired(first$1);
      if ($) {
        return new Ok(first$1);
      } else {
        loop$list = rest$1;
        loop$is_desired = is_desired;
      }
    }
  }
}
function sequences(loop$list, loop$compare, loop$growing, loop$direction, loop$prev, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let compare4 = loop$compare;
    let growing = loop$growing;
    let direction = loop$direction;
    let prev = loop$prev;
    let acc = loop$acc;
    let growing$1 = prepend(prev, growing);
    if (list4 instanceof Empty) {
      if (direction instanceof Ascending) {
        return prepend(reverse(growing$1), acc);
      } else {
        return prepend(growing$1, acc);
      }
    } else {
      let new$1 = list4.head;
      let rest$1 = list4.tail;
      let $ = compare4(prev, new$1);
      if (direction instanceof Ascending) {
        if ($ instanceof Lt) {
          loop$list = rest$1;
          loop$compare = compare4;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else if ($ instanceof Eq) {
          loop$list = rest$1;
          loop$compare = compare4;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else {
          let _block;
          if (direction instanceof Ascending) {
            _block = prepend(reverse(growing$1), acc);
          } else {
            _block = prepend(growing$1, acc);
          }
          let acc$1 = _block;
          if (rest$1 instanceof Empty) {
            return prepend(toList([new$1]), acc$1);
          } else {
            let next = rest$1.head;
            let rest$2 = rest$1.tail;
            let _block$1;
            let $1 = compare4(new$1, next);
            if ($1 instanceof Lt) {
              _block$1 = new Ascending();
            } else if ($1 instanceof Eq) {
              _block$1 = new Ascending();
            } else {
              _block$1 = new Descending();
            }
            let direction$1 = _block$1;
            loop$list = rest$2;
            loop$compare = compare4;
            loop$growing = toList([new$1]);
            loop$direction = direction$1;
            loop$prev = next;
            loop$acc = acc$1;
          }
        }
      } else if ($ instanceof Lt) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare4(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending();
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending();
          } else {
            _block$1 = new Descending();
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else if ($ instanceof Eq) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare4(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending();
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending();
          } else {
            _block$1 = new Descending();
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare4;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else {
        loop$list = rest$1;
        loop$compare = compare4;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      }
    }
  }
}
function merge_ascendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list22 = loop$list2;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list4 = list22;
      return reverse_and_prepend(list4, acc);
    } else if (list22 instanceof Empty) {
      let list4 = list1;
      return reverse_and_prepend(list4, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list22.head;
      let rest2 = list22.tail;
      let $ = compare4(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first2, acc);
      } else {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first2, acc);
      }
    }
  }
}
function merge_ascending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (sequences2 instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let ascending1 = sequences2.head;
        let ascending2 = $.head;
        let rest$1 = $.tail;
        let descending = merge_ascendings(
          ascending1,
          ascending2,
          compare4,
          toList([])
        );
        loop$sequences = rest$1;
        loop$compare = compare4;
        loop$acc = prepend(descending, acc);
      }
    }
  }
}
function merge_descendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list22 = loop$list2;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list4 = list22;
      return reverse_and_prepend(list4, acc);
    } else if (list22 instanceof Empty) {
      let list4 = list1;
      return reverse_and_prepend(list4, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list22.head;
      let rest2 = list22.tail;
      let $ = compare4(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare4;
        loop$acc = prepend(first2, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      } else {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare4;
        loop$acc = prepend(first1, acc);
      }
    }
  }
}
function merge_descending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare4 = loop$compare;
    let acc = loop$acc;
    if (sequences2 instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let descending1 = sequences2.head;
        let descending2 = $.head;
        let rest$1 = $.tail;
        let ascending = merge_descendings(
          descending1,
          descending2,
          compare4,
          toList([])
        );
        loop$sequences = rest$1;
        loop$compare = compare4;
        loop$acc = prepend(ascending, acc);
      }
    }
  }
}
function merge_all(loop$sequences, loop$direction, loop$compare) {
  while (true) {
    let sequences2 = loop$sequences;
    let direction = loop$direction;
    let compare4 = loop$compare;
    if (sequences2 instanceof Empty) {
      return sequences2;
    } else if (direction instanceof Ascending) {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return sequence;
      } else {
        let sequences$1 = merge_ascending_pairs(sequences2, compare4, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Descending();
        loop$compare = compare4;
      }
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(sequence);
      } else {
        let sequences$1 = merge_descending_pairs(sequences2, compare4, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Ascending();
        loop$compare = compare4;
      }
    }
  }
}
function sort(list4, compare4) {
  if (list4 instanceof Empty) {
    return list4;
  } else {
    let $ = list4.tail;
    if ($ instanceof Empty) {
      return list4;
    } else {
      let x = list4.head;
      let y = $.head;
      let rest$1 = $.tail;
      let _block;
      let $1 = compare4(x, y);
      if ($1 instanceof Lt) {
        _block = new Ascending();
      } else if ($1 instanceof Eq) {
        _block = new Ascending();
      } else {
        _block = new Descending();
      }
      let direction = _block;
      let sequences$1 = sequences(
        rest$1,
        compare4,
        toList([x]),
        direction,
        y,
        toList([])
      );
      return merge_all(sequences$1, new Ascending(), compare4);
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function try$(result, fun) {
  if (result instanceof Ok) {
    let x = result[0];
    return fun(x);
  } else {
    return result;
  }
}
function unwrap(result, default$) {
  if (result instanceof Ok) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/function.mjs
function identity2(x) {
  return x;
}

// build/dev/javascript/gleam_json/gleam_json_ffi.mjs
function object(entries) {
  return Object.fromEntries(entries);
}
function identity3(x) {
  return x;
}
function array(list4) {
  return list4.toArray();
}
function do_null() {
  return null;
}

// build/dev/javascript/gleam_json/gleam/json.mjs
function string3(input) {
  return identity3(input);
}
function float3(input) {
  return identity3(input);
}
function null$() {
  return do_null();
}
function object2(entries) {
  return object(entries);
}
function preprocessed_array(from3) {
  return array(from3);
}

// build/dev/javascript/lustre/lustre/internals/constants.ffi.mjs
var document2 = () => globalThis?.document;
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var SUPPORTS_MOVE_BEFORE = !!globalThis.HTMLElement?.prototype?.moveBefore;

// build/dev/javascript/lustre/lustre/internals/constants.mjs
var empty_list = /* @__PURE__ */ toList([]);
var option_none = /* @__PURE__ */ new None();

// build/dev/javascript/lustre/lustre/vdom/vattr.ffi.mjs
var GT = /* @__PURE__ */ new Gt();
var LT = /* @__PURE__ */ new Lt();
var EQ = /* @__PURE__ */ new Eq();
function compare3(a2, b) {
  if (a2.name === b.name) {
    return EQ;
  } else if (a2.name < b.name) {
    return LT;
  } else {
    return GT;
  }
}

// build/dev/javascript/lustre/lustre/vdom/vattr.mjs
var Attribute = class extends CustomType {
  constructor(kind, name2, value) {
    super();
    this.kind = kind;
    this.name = name2;
    this.value = value;
  }
};
var Property = class extends CustomType {
  constructor(kind, name2, value) {
    super();
    this.kind = kind;
    this.name = name2;
    this.value = value;
  }
};
var Event2 = class extends CustomType {
  constructor(kind, name2, handler2, include, prevent_default3, stop_propagation2, immediate, debounce, throttle) {
    super();
    this.kind = kind;
    this.name = name2;
    this.handler = handler2;
    this.include = include;
    this.prevent_default = prevent_default3;
    this.stop_propagation = stop_propagation2;
    this.immediate = immediate;
    this.debounce = debounce;
    this.throttle = throttle;
  }
};
var Handler = class extends CustomType {
  constructor(prevent_default3, stop_propagation2, message) {
    super();
    this.prevent_default = prevent_default3;
    this.stop_propagation = stop_propagation2;
    this.message = message;
  }
};
var Never = class extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
};
var Possible = class extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
};
var Always = class extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
};
function merge(loop$attributes, loop$merged) {
  while (true) {
    let attributes = loop$attributes;
    let merged = loop$merged;
    if (attributes instanceof Empty) {
      return merged;
    } else {
      let $ = attributes.head;
      if ($ instanceof Attribute) {
        let $1 = $.name;
        if ($1 === "") {
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = merged;
        } else if ($1 === "class") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "class") {
                  let kind = $.kind;
                  let class1 = $2;
                  let rest = $3.tail;
                  let class2 = $4.value;
                  let value = class1 + " " + class2;
                  let attribute$1 = new Attribute(kind, "class", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else if ($1 === "style") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "style") {
                  let kind = $.kind;
                  let style1 = $2;
                  let rest = $3.tail;
                  let style22 = $4.value;
                  let value = style1 + ";" + style22;
                  let attribute$1 = new Attribute(kind, "style", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else {
          let attribute$1 = $;
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = prepend(attribute$1, merged);
        }
      } else {
        let attribute$1 = $;
        let rest = attributes.tail;
        loop$attributes = rest;
        loop$merged = prepend(attribute$1, merged);
      }
    }
  }
}
function prepare(attributes) {
  if (attributes instanceof Empty) {
    return attributes;
  } else {
    let $ = attributes.tail;
    if ($ instanceof Empty) {
      return attributes;
    } else {
      let _pipe = attributes;
      let _pipe$1 = sort(_pipe, (a2, b) => {
        return compare3(b, a2);
      });
      return merge(_pipe$1, empty_list);
    }
  }
}
var attribute_kind = 0;
function attribute(name2, value) {
  return new Attribute(attribute_kind, name2, value);
}
var property_kind = 1;
function property(name2, value) {
  return new Property(property_kind, name2, value);
}
var event_kind = 2;
function event(name2, handler2, include, prevent_default3, stop_propagation2, immediate, debounce, throttle) {
  return new Event2(
    event_kind,
    name2,
    handler2,
    include,
    prevent_default3,
    stop_propagation2,
    immediate,
    debounce,
    throttle
  );
}
var never_kind = 0;
var never = /* @__PURE__ */ new Never(never_kind);
var possible_kind = 1;
var possible = /* @__PURE__ */ new Possible(possible_kind);
var always_kind = 2;
var always = /* @__PURE__ */ new Always(always_kind);

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute2(name2, value) {
  return attribute(name2, value);
}
function property2(name2, value) {
  return property(name2, value);
}
function class$(name2) {
  return attribute2("class", name2);
}
function data(key, value) {
  return attribute2("data-" + key, value);
}
function id(value) {
  return attribute2("id", value);
}
function style(property3, value) {
  if (property3 === "") {
    return class$("");
  } else if (value === "") {
    return class$("");
  } else {
    return attribute2("style", property3 + ":" + value + ";");
  }
}
function do_styles(loop$properties, loop$styles) {
  while (true) {
    let properties = loop$properties;
    let styles2 = loop$styles;
    if (properties instanceof Empty) {
      return styles2;
    } else {
      let $ = properties.head[0];
      if ($ === "") {
        let rest = properties.tail;
        loop$properties = rest;
        loop$styles = styles2;
      } else {
        let $1 = properties.head[1];
        if ($1 === "") {
          let rest = properties.tail;
          loop$properties = rest;
          loop$styles = styles2;
        } else {
          let rest = properties.tail;
          let name$1 = $;
          let value$1 = $1;
          loop$properties = rest;
          loop$styles = styles2 + name$1 + ":" + value$1 + ";";
        }
      }
    }
  }
}
function styles(properties) {
  return attribute2("style", do_styles(properties, ""));
}
function href(url) {
  return attribute2("href", url);
}
function target(value) {
  return attribute2("target", value);
}
function rel(value) {
  return attribute2("rel", value);
}
function alt(text4) {
  return attribute2("alt", text4);
}
function src(url) {
  return attribute2("src", url);
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(synchronous, before_paint2, after_paint2) {
    super();
    this.synchronous = synchronous;
    this.before_paint = before_paint2;
    this.after_paint = after_paint2;
  }
};
var empty = /* @__PURE__ */ new Effect(
  /* @__PURE__ */ toList([]),
  /* @__PURE__ */ toList([]),
  /* @__PURE__ */ toList([])
);
function none() {
  return empty;
}
function from(effect) {
  let task = (actions) => {
    let dispatch = actions.dispatch;
    return effect(dispatch);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}
function before_paint(effect) {
  let task = (actions) => {
    let root9 = actions.root();
    let dispatch = actions.dispatch;
    return effect(dispatch, root9);
  };
  return new Effect(empty.synchronous, toList([task]), empty.after_paint);
}
function after_paint(effect) {
  let task = (actions) => {
    let root9 = actions.root();
    let dispatch = actions.dispatch;
    return effect(dispatch, root9);
  };
  return new Effect(empty.synchronous, empty.before_paint, toList([task]));
}
function event2(name2, data2) {
  let task = (actions) => {
    return actions.emit(name2, data2);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}
function provide(key, value) {
  let task = (actions) => {
    return actions.provide(key, value);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}
function batch(effects) {
  return fold2(
    effects,
    empty,
    (acc, eff) => {
      return new Effect(
        fold2(eff.synchronous, acc.synchronous, prepend2),
        fold2(eff.before_paint, acc.before_paint, prepend2),
        fold2(eff.after_paint, acc.after_paint, prepend2)
      );
    }
  );
}

// build/dev/javascript/lustre/lustre/internals/mutable_map.ffi.mjs
function empty2() {
  return null;
}
function get(map4, key) {
  const value = map4?.get(key);
  if (value != null) {
    return new Ok(value);
  } else {
    return new Error(void 0);
  }
}
function has_key2(map4, key) {
  return map4 && map4.has(key);
}
function insert2(map4, key, value) {
  map4 ??= /* @__PURE__ */ new Map();
  map4.set(key, value);
  return map4;
}
function remove(map4, key) {
  map4?.delete(key);
  return map4;
}

// build/dev/javascript/lustre/lustre/vdom/path.mjs
var Root = class extends CustomType {
};
var Key = class extends CustomType {
  constructor(key, parent) {
    super();
    this.key = key;
    this.parent = parent;
  }
};
var Index = class extends CustomType {
  constructor(index4, parent) {
    super();
    this.index = index4;
    this.parent = parent;
  }
};
function do_matches(loop$path, loop$candidates) {
  while (true) {
    let path2 = loop$path;
    let candidates = loop$candidates;
    if (candidates instanceof Empty) {
      return false;
    } else {
      let candidate = candidates.head;
      let rest = candidates.tail;
      let $ = starts_with(path2, candidate);
      if ($) {
        return $;
      } else {
        loop$path = path2;
        loop$candidates = rest;
      }
    }
  }
}
function add2(parent, index4, key) {
  if (key === "") {
    return new Index(index4, parent);
  } else {
    return new Key(key, parent);
  }
}
var root2 = /* @__PURE__ */ new Root();
var separator_element = "	";
function do_to_string(loop$path, loop$acc) {
  while (true) {
    let path2 = loop$path;
    let acc = loop$acc;
    if (path2 instanceof Root) {
      if (acc instanceof Empty) {
        return "";
      } else {
        let segments = acc.tail;
        return concat2(segments);
      }
    } else if (path2 instanceof Key) {
      let key = path2.key;
      let parent = path2.parent;
      loop$path = parent;
      loop$acc = prepend(separator_element, prepend(key, acc));
    } else {
      let index4 = path2.index;
      let parent = path2.parent;
      loop$path = parent;
      loop$acc = prepend(
        separator_element,
        prepend(to_string(index4), acc)
      );
    }
  }
}
function to_string2(path2) {
  return do_to_string(path2, toList([]));
}
function matches(path2, candidates) {
  if (candidates instanceof Empty) {
    return false;
  } else {
    return do_matches(to_string2(path2), candidates);
  }
}
var separator_event = "\n";
function event3(path2, event4) {
  return do_to_string(path2, toList([separator_event, event4]));
}

// build/dev/javascript/lustre/lustre/vdom/vnode.mjs
var Fragment = class extends CustomType {
  constructor(kind, key, mapper, children2, keyed_children) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.children = children2;
    this.keyed_children = keyed_children;
  }
};
var Element = class extends CustomType {
  constructor(kind, key, mapper, namespace2, tag8, attributes, children2, keyed_children, self_closing, void$) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.namespace = namespace2;
    this.tag = tag8;
    this.attributes = attributes;
    this.children = children2;
    this.keyed_children = keyed_children;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Text = class extends CustomType {
  constructor(kind, key, mapper, content) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.content = content;
  }
};
var UnsafeInnerHtml = class extends CustomType {
  constructor(kind, key, mapper, namespace2, tag8, attributes, inner_html) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.namespace = namespace2;
    this.tag = tag8;
    this.attributes = attributes;
    this.inner_html = inner_html;
  }
};
function is_void_element(tag8, namespace2) {
  if (namespace2 === "") {
    if (tag8 === "area") {
      return true;
    } else if (tag8 === "base") {
      return true;
    } else if (tag8 === "br") {
      return true;
    } else if (tag8 === "col") {
      return true;
    } else if (tag8 === "embed") {
      return true;
    } else if (tag8 === "hr") {
      return true;
    } else if (tag8 === "img") {
      return true;
    } else if (tag8 === "input") {
      return true;
    } else if (tag8 === "link") {
      return true;
    } else if (tag8 === "meta") {
      return true;
    } else if (tag8 === "param") {
      return true;
    } else if (tag8 === "source") {
      return true;
    } else if (tag8 === "track") {
      return true;
    } else if (tag8 === "wbr") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function to_keyed(key, node2) {
  if (node2 instanceof Fragment) {
    return new Fragment(
      node2.kind,
      key,
      node2.mapper,
      node2.children,
      node2.keyed_children
    );
  } else if (node2 instanceof Element) {
    return new Element(
      node2.kind,
      key,
      node2.mapper,
      node2.namespace,
      node2.tag,
      node2.attributes,
      node2.children,
      node2.keyed_children,
      node2.self_closing,
      node2.void
    );
  } else if (node2 instanceof Text) {
    return new Text(node2.kind, key, node2.mapper, node2.content);
  } else {
    return new UnsafeInnerHtml(
      node2.kind,
      key,
      node2.mapper,
      node2.namespace,
      node2.tag,
      node2.attributes,
      node2.inner_html
    );
  }
}
var fragment_kind = 0;
function fragment(key, mapper, children2, keyed_children) {
  return new Fragment(fragment_kind, key, mapper, children2, keyed_children);
}
var element_kind = 1;
function element(key, mapper, namespace2, tag8, attributes, children2, keyed_children, self_closing, void$) {
  return new Element(
    element_kind,
    key,
    mapper,
    namespace2,
    tag8,
    prepare(attributes),
    children2,
    keyed_children,
    self_closing,
    void$ || is_void_element(tag8, namespace2)
  );
}
var text_kind = 2;
function text(key, mapper, content) {
  return new Text(text_kind, key, mapper, content);
}
var unsafe_inner_html_kind = 3;
function unsafe_inner_html(key, mapper, namespace2, tag8, attributes, inner_html) {
  return new UnsafeInnerHtml(
    unsafe_inner_html_kind,
    key,
    mapper,
    namespace2,
    tag8,
    prepare(attributes),
    inner_html
  );
}

// build/dev/javascript/lustre/lustre/internals/equals.ffi.mjs
var isReferenceEqual = (a2, b) => a2 === b;
var isEqual2 = (a2, b) => {
  if (a2 === b) {
    return true;
  }
  if (a2 == null || b == null) {
    return false;
  }
  const type = typeof a2;
  if (type !== typeof b) {
    return false;
  }
  if (type !== "object") {
    return false;
  }
  const ctor = a2.constructor;
  if (ctor !== b.constructor) {
    return false;
  }
  if (Array.isArray(a2)) {
    return areArraysEqual(a2, b);
  }
  return areObjectsEqual(a2, b);
};
var areArraysEqual = (a2, b) => {
  let index4 = a2.length;
  if (index4 !== b.length) {
    return false;
  }
  while (index4--) {
    if (!isEqual2(a2[index4], b[index4])) {
      return false;
    }
  }
  return true;
};
var areObjectsEqual = (a2, b) => {
  const properties = Object.keys(a2);
  let index4 = properties.length;
  if (Object.keys(b).length !== index4) {
    return false;
  }
  while (index4--) {
    const property3 = properties[index4];
    if (!Object.hasOwn(b, property3)) {
      return false;
    }
    if (!isEqual2(a2[property3], b[property3])) {
      return false;
    }
  }
  return true;
};

// build/dev/javascript/lustre/lustre/vdom/events.mjs
var Events = class extends CustomType {
  constructor(handlers, dispatched_paths, next_dispatched_paths) {
    super();
    this.handlers = handlers;
    this.dispatched_paths = dispatched_paths;
    this.next_dispatched_paths = next_dispatched_paths;
  }
};
function new$3() {
  return new Events(
    empty2(),
    empty_list,
    empty_list
  );
}
function tick(events) {
  return new Events(
    events.handlers,
    events.next_dispatched_paths,
    empty_list
  );
}
function do_remove_event(handlers, path2, name2) {
  return remove(handlers, event3(path2, name2));
}
function remove_event(events, path2, name2) {
  let handlers = do_remove_event(events.handlers, path2, name2);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function remove_attributes(handlers, path2, attributes) {
  return fold2(
    attributes,
    handlers,
    (events, attribute4) => {
      if (attribute4 instanceof Event2) {
        let name2 = attribute4.name;
        return do_remove_event(events, path2, name2);
      } else {
        return events;
      }
    }
  );
}
function handle(events, path2, name2, event4) {
  let next_dispatched_paths = prepend(path2, events.next_dispatched_paths);
  let events$1 = new Events(
    events.handlers,
    events.dispatched_paths,
    next_dispatched_paths
  );
  let $ = get(
    events$1.handlers,
    path2 + separator_event + name2
  );
  if ($ instanceof Ok) {
    let handler2 = $[0];
    return [events$1, run(event4, handler2)];
  } else {
    return [events$1, new Error(toList([]))];
  }
}
function has_dispatched_events(events, path2) {
  return matches(path2, events.dispatched_paths);
}
function do_add_event(handlers, mapper, path2, name2, handler2) {
  return insert2(
    handlers,
    event3(path2, name2),
    map2(
      handler2,
      (handler3) => {
        return new Handler(
          handler3.prevent_default,
          handler3.stop_propagation,
          identity2(mapper)(handler3.message)
        );
      }
    )
  );
}
function add_event(events, mapper, path2, name2, handler2) {
  let handlers = do_add_event(events.handlers, mapper, path2, name2, handler2);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function add_attributes(handlers, mapper, path2, attributes) {
  return fold2(
    attributes,
    handlers,
    (events, attribute4) => {
      if (attribute4 instanceof Event2) {
        let name2 = attribute4.name;
        let handler2 = attribute4.handler;
        return do_add_event(events, mapper, path2, name2, handler2);
      } else {
        return events;
      }
    }
  );
}
function compose_mapper(mapper, child_mapper) {
  let $ = isReferenceEqual(mapper, identity2);
  let $1 = isReferenceEqual(child_mapper, identity2);
  if ($1) {
    return mapper;
  } else if ($) {
    return child_mapper;
  } else {
    return (msg) => {
      return mapper(child_mapper(msg));
    };
  }
}
function do_remove_children(loop$handlers, loop$path, loop$child_index, loop$children) {
  while (true) {
    let handlers = loop$handlers;
    let path2 = loop$path;
    let child_index = loop$child_index;
    let children2 = loop$children;
    if (children2 instanceof Empty) {
      return handlers;
    } else {
      let child = children2.head;
      let rest = children2.tail;
      let _pipe = handlers;
      let _pipe$1 = do_remove_child(_pipe, path2, child_index, child);
      loop$handlers = _pipe$1;
      loop$path = path2;
      loop$child_index = child_index + 1;
      loop$children = rest;
    }
  }
}
function do_remove_child(handlers, parent, child_index, child) {
  if (child instanceof Fragment) {
    let children2 = child.children;
    let path2 = add2(parent, child_index, child.key);
    return do_remove_children(handlers, path2, 0, children2);
  } else if (child instanceof Element) {
    let attributes = child.attributes;
    let children2 = child.children;
    let path2 = add2(parent, child_index, child.key);
    let _pipe = handlers;
    let _pipe$1 = remove_attributes(_pipe, path2, attributes);
    return do_remove_children(_pipe$1, path2, 0, children2);
  } else if (child instanceof Text) {
    return handlers;
  } else {
    let attributes = child.attributes;
    let path2 = add2(parent, child_index, child.key);
    return remove_attributes(handlers, path2, attributes);
  }
}
function remove_child(events, parent, child_index, child) {
  let handlers = do_remove_child(events.handlers, parent, child_index, child);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function do_add_children(loop$handlers, loop$mapper, loop$path, loop$child_index, loop$children) {
  while (true) {
    let handlers = loop$handlers;
    let mapper = loop$mapper;
    let path2 = loop$path;
    let child_index = loop$child_index;
    let children2 = loop$children;
    if (children2 instanceof Empty) {
      return handlers;
    } else {
      let child = children2.head;
      let rest = children2.tail;
      let _pipe = handlers;
      let _pipe$1 = do_add_child(_pipe, mapper, path2, child_index, child);
      loop$handlers = _pipe$1;
      loop$mapper = mapper;
      loop$path = path2;
      loop$child_index = child_index + 1;
      loop$children = rest;
    }
  }
}
function do_add_child(handlers, mapper, parent, child_index, child) {
  if (child instanceof Fragment) {
    let children2 = child.children;
    let path2 = add2(parent, child_index, child.key);
    let composed_mapper = compose_mapper(mapper, child.mapper);
    return do_add_children(handlers, composed_mapper, path2, 0, children2);
  } else if (child instanceof Element) {
    let attributes = child.attributes;
    let children2 = child.children;
    let path2 = add2(parent, child_index, child.key);
    let composed_mapper = compose_mapper(mapper, child.mapper);
    let _pipe = handlers;
    let _pipe$1 = add_attributes(_pipe, composed_mapper, path2, attributes);
    return do_add_children(_pipe$1, composed_mapper, path2, 0, children2);
  } else if (child instanceof Text) {
    return handlers;
  } else {
    let attributes = child.attributes;
    let path2 = add2(parent, child_index, child.key);
    let composed_mapper = compose_mapper(mapper, child.mapper);
    return add_attributes(handlers, composed_mapper, path2, attributes);
  }
}
function add_child(events, mapper, parent, index4, child) {
  let handlers = do_add_child(events.handlers, mapper, parent, index4, child);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function add_children(events, mapper, path2, child_index, children2) {
  let handlers = do_add_children(
    events.handlers,
    mapper,
    path2,
    child_index,
    children2
  );
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}

// build/dev/javascript/lustre/lustre/element.mjs
function element2(tag8, attributes, children2) {
  return element(
    "",
    identity2,
    "",
    tag8,
    attributes,
    children2,
    empty2(),
    false,
    false
  );
}
function namespaced(namespace2, tag8, attributes, children2) {
  return element(
    "",
    identity2,
    namespace2,
    tag8,
    attributes,
    children2,
    empty2(),
    false,
    false
  );
}
function text2(content) {
  return text("", identity2, content);
}
function none2() {
  return text("", identity2, "");
}
function fragment2(children2) {
  return fragment("", identity2, children2, empty2());
}
function unsafe_raw_html(namespace2, tag8, attributes, inner_html) {
  return unsafe_inner_html(
    "",
    identity2,
    namespace2,
    tag8,
    attributes,
    inner_html
  );
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function html(attrs, children2) {
  return element2("html", attrs, children2);
}
function text3(content) {
  return text2(content);
}
function head(attrs, children2) {
  return element2("head", attrs, children2);
}
function link(attrs) {
  return element2("link", attrs, empty_list);
}
function style2(attrs, css) {
  return unsafe_raw_html("", "style", attrs, css);
}
function title(attrs, content) {
  return element2("title", attrs, toList([text3(content)]));
}
function body(attrs, children2) {
  return element2("body", attrs, children2);
}
function h1(attrs, children2) {
  return element2("h1", attrs, children2);
}
function h3(attrs, children2) {
  return element2("h3", attrs, children2);
}
function div(attrs, children2) {
  return element2("div", attrs, children2);
}
function p(attrs, children2) {
  return element2("p", attrs, children2);
}
function a(attrs, children2) {
  return element2("a", attrs, children2);
}
function span(attrs, children2) {
  return element2("span", attrs, children2);
}
function img(attrs) {
  return element2("img", attrs, empty_list);
}
function svg(attrs, children2) {
  return namespaced("http://www.w3.org/2000/svg", "svg", attrs, children2);
}
function button(attrs, children2) {
  return element2("button", attrs, children2);
}
function slot(attrs, fallback) {
  return element2("slot", attrs, fallback);
}

// build/dev/javascript/lustre/lustre/vdom/patch.mjs
var Patch = class extends CustomType {
  constructor(index4, removed, changes, children2) {
    super();
    this.index = index4;
    this.removed = removed;
    this.changes = changes;
    this.children = children2;
  }
};
var ReplaceText = class extends CustomType {
  constructor(kind, content) {
    super();
    this.kind = kind;
    this.content = content;
  }
};
var ReplaceInnerHtml = class extends CustomType {
  constructor(kind, inner_html) {
    super();
    this.kind = kind;
    this.inner_html = inner_html;
  }
};
var Update = class extends CustomType {
  constructor(kind, added, removed) {
    super();
    this.kind = kind;
    this.added = added;
    this.removed = removed;
  }
};
var Move = class extends CustomType {
  constructor(kind, key, before) {
    super();
    this.kind = kind;
    this.key = key;
    this.before = before;
  }
};
var Replace = class extends CustomType {
  constructor(kind, index4, with$) {
    super();
    this.kind = kind;
    this.index = index4;
    this.with = with$;
  }
};
var Remove = class extends CustomType {
  constructor(kind, index4) {
    super();
    this.kind = kind;
    this.index = index4;
  }
};
var Insert = class extends CustomType {
  constructor(kind, children2, before) {
    super();
    this.kind = kind;
    this.children = children2;
    this.before = before;
  }
};
function new$5(index4, removed, changes, children2) {
  return new Patch(index4, removed, changes, children2);
}
var replace_text_kind = 0;
function replace_text(content) {
  return new ReplaceText(replace_text_kind, content);
}
var replace_inner_html_kind = 1;
function replace_inner_html(inner_html) {
  return new ReplaceInnerHtml(replace_inner_html_kind, inner_html);
}
var update_kind = 2;
function update(added, removed) {
  return new Update(update_kind, added, removed);
}
var move_kind = 3;
function move(key, before) {
  return new Move(move_kind, key, before);
}
var remove_kind = 4;
function remove2(index4) {
  return new Remove(remove_kind, index4);
}
var replace_kind = 5;
function replace2(index4, with$) {
  return new Replace(replace_kind, index4, with$);
}
var insert_kind = 6;
function insert3(children2, before) {
  return new Insert(insert_kind, children2, before);
}

// build/dev/javascript/lustre/lustre/vdom/diff.mjs
var Diff = class extends CustomType {
  constructor(patch, events) {
    super();
    this.patch = patch;
    this.events = events;
  }
};
var AttributeChange = class extends CustomType {
  constructor(added, removed, events) {
    super();
    this.added = added;
    this.removed = removed;
    this.events = events;
  }
};
function is_controlled(events, namespace2, tag8, path2) {
  if (tag8 === "input" && namespace2 === "") {
    return has_dispatched_events(events, path2);
  } else if (tag8 === "select" && namespace2 === "") {
    return has_dispatched_events(events, path2);
  } else if (tag8 === "textarea" && namespace2 === "") {
    return has_dispatched_events(events, path2);
  } else {
    return false;
  }
}
function diff_attributes(loop$controlled, loop$path, loop$mapper, loop$events, loop$old, loop$new, loop$added, loop$removed) {
  while (true) {
    let controlled2 = loop$controlled;
    let path2 = loop$path;
    let mapper = loop$mapper;
    let events = loop$events;
    let old = loop$old;
    let new$10 = loop$new;
    let added = loop$added;
    let removed = loop$removed;
    if (old instanceof Empty) {
      if (new$10 instanceof Empty) {
        return new AttributeChange(added, removed, events);
      } else {
        let $ = new$10.head;
        if ($ instanceof Event2) {
          let next = $;
          let new$1 = new$10.tail;
          let name2 = $.name;
          let handler2 = $.handler;
          let added$1 = prepend(next, added);
          let events$1 = add_event(events, mapper, path2, name2, handler2);
          loop$controlled = controlled2;
          loop$path = path2;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = old;
          loop$new = new$1;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let next = $;
          let new$1 = new$10.tail;
          let added$1 = prepend(next, added);
          loop$controlled = controlled2;
          loop$path = path2;
          loop$mapper = mapper;
          loop$events = events;
          loop$old = old;
          loop$new = new$1;
          loop$added = added$1;
          loop$removed = removed;
        }
      }
    } else if (new$10 instanceof Empty) {
      let $ = old.head;
      if ($ instanceof Event2) {
        let prev = $;
        let old$1 = old.tail;
        let name2 = $.name;
        let removed$1 = prepend(prev, removed);
        let events$1 = remove_event(events, path2, name2);
        loop$controlled = controlled2;
        loop$path = path2;
        loop$mapper = mapper;
        loop$events = events$1;
        loop$old = old$1;
        loop$new = new$10;
        loop$added = added;
        loop$removed = removed$1;
      } else {
        let prev = $;
        let old$1 = old.tail;
        let removed$1 = prepend(prev, removed);
        loop$controlled = controlled2;
        loop$path = path2;
        loop$mapper = mapper;
        loop$events = events;
        loop$old = old$1;
        loop$new = new$10;
        loop$added = added;
        loop$removed = removed$1;
      }
    } else {
      let prev = old.head;
      let remaining_old = old.tail;
      let next = new$10.head;
      let remaining_new = new$10.tail;
      let $ = compare3(prev, next);
      if ($ instanceof Lt) {
        if (prev instanceof Event2) {
          let name2 = prev.name;
          let removed$1 = prepend(prev, removed);
          let events$1 = remove_event(events, path2, name2);
          loop$controlled = controlled2;
          loop$path = path2;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = remaining_old;
          loop$new = new$10;
          loop$added = added;
          loop$removed = removed$1;
        } else {
          let removed$1 = prepend(prev, removed);
          loop$controlled = controlled2;
          loop$path = path2;
          loop$mapper = mapper;
          loop$events = events;
          loop$old = remaining_old;
          loop$new = new$10;
          loop$added = added;
          loop$removed = removed$1;
        }
      } else if ($ instanceof Eq) {
        if (prev instanceof Attribute) {
          if (next instanceof Attribute) {
            let _block;
            let $1 = next.name;
            if ($1 === "value") {
              _block = controlled2 || prev.value !== next.value;
            } else if ($1 === "checked") {
              _block = controlled2 || prev.value !== next.value;
            } else if ($1 === "selected") {
              _block = controlled2 || prev.value !== next.value;
            } else {
              _block = prev.value !== next.value;
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled2;
            loop$path = path2;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (next instanceof Event2) {
            let name2 = next.name;
            let handler2 = next.handler;
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            let events$1 = add_event(
              events,
              mapper,
              path2,
              name2,
              handler2
            );
            loop$controlled = controlled2;
            loop$path = path2;
            loop$mapper = mapper;
            loop$events = events$1;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          } else {
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            loop$controlled = controlled2;
            loop$path = path2;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          }
        } else if (prev instanceof Property) {
          if (next instanceof Property) {
            let _block;
            let $1 = next.name;
            if ($1 === "scrollLeft") {
              _block = true;
            } else if ($1 === "scrollRight") {
              _block = true;
            } else if ($1 === "value") {
              _block = controlled2 || !isEqual2(
                prev.value,
                next.value
              );
            } else if ($1 === "checked") {
              _block = controlled2 || !isEqual2(
                prev.value,
                next.value
              );
            } else if ($1 === "selected") {
              _block = controlled2 || !isEqual2(
                prev.value,
                next.value
              );
            } else {
              _block = !isEqual2(prev.value, next.value);
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled2;
            loop$path = path2;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (next instanceof Event2) {
            let name2 = next.name;
            let handler2 = next.handler;
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            let events$1 = add_event(
              events,
              mapper,
              path2,
              name2,
              handler2
            );
            loop$controlled = controlled2;
            loop$path = path2;
            loop$mapper = mapper;
            loop$events = events$1;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          } else {
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            loop$controlled = controlled2;
            loop$path = path2;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          }
        } else if (next instanceof Event2) {
          let name2 = next.name;
          let handler2 = next.handler;
          let has_changes = prev.prevent_default.kind !== next.prevent_default.kind || prev.stop_propagation.kind !== next.stop_propagation.kind || prev.immediate !== next.immediate || prev.debounce !== next.debounce || prev.throttle !== next.throttle;
          let _block;
          if (has_changes) {
            _block = prepend(next, added);
          } else {
            _block = added;
          }
          let added$1 = _block;
          let events$1 = add_event(events, mapper, path2, name2, handler2);
          loop$controlled = controlled2;
          loop$path = path2;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let name2 = prev.name;
          let added$1 = prepend(next, added);
          let removed$1 = prepend(prev, removed);
          let events$1 = remove_event(events, path2, name2);
          loop$controlled = controlled2;
          loop$path = path2;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = added$1;
          loop$removed = removed$1;
        }
      } else if (next instanceof Event2) {
        let name2 = next.name;
        let handler2 = next.handler;
        let added$1 = prepend(next, added);
        let events$1 = add_event(events, mapper, path2, name2, handler2);
        loop$controlled = controlled2;
        loop$path = path2;
        loop$mapper = mapper;
        loop$events = events$1;
        loop$old = old;
        loop$new = remaining_new;
        loop$added = added$1;
        loop$removed = removed;
      } else {
        let added$1 = prepend(next, added);
        loop$controlled = controlled2;
        loop$path = path2;
        loop$mapper = mapper;
        loop$events = events;
        loop$old = old;
        loop$new = remaining_new;
        loop$added = added$1;
        loop$removed = removed;
      }
    }
  }
}
function do_diff(loop$old, loop$old_keyed, loop$new, loop$new_keyed, loop$moved, loop$moved_offset, loop$removed, loop$node_index, loop$patch_index, loop$path, loop$changes, loop$children, loop$mapper, loop$events) {
  while (true) {
    let old = loop$old;
    let old_keyed = loop$old_keyed;
    let new$10 = loop$new;
    let new_keyed = loop$new_keyed;
    let moved = loop$moved;
    let moved_offset = loop$moved_offset;
    let removed = loop$removed;
    let node_index = loop$node_index;
    let patch_index = loop$patch_index;
    let path2 = loop$path;
    let changes = loop$changes;
    let children2 = loop$children;
    let mapper = loop$mapper;
    let events = loop$events;
    if (old instanceof Empty) {
      if (new$10 instanceof Empty) {
        return new Diff(
          new Patch(patch_index, removed, changes, children2),
          events
        );
      } else {
        let events$1 = add_children(
          events,
          mapper,
          path2,
          node_index,
          new$10
        );
        let insert4 = insert3(new$10, node_index - moved_offset);
        let changes$1 = prepend(insert4, changes);
        return new Diff(
          new Patch(patch_index, removed, changes$1, children2),
          events$1
        );
      }
    } else if (new$10 instanceof Empty) {
      let prev = old.head;
      let old$1 = old.tail;
      let _block;
      let $ = prev.key === "" || !has_key2(moved, prev.key);
      if ($) {
        _block = removed + 1;
      } else {
        _block = removed;
      }
      let removed$1 = _block;
      let events$1 = remove_child(events, path2, node_index, prev);
      loop$old = old$1;
      loop$old_keyed = old_keyed;
      loop$new = new$10;
      loop$new_keyed = new_keyed;
      loop$moved = moved;
      loop$moved_offset = moved_offset;
      loop$removed = removed$1;
      loop$node_index = node_index;
      loop$patch_index = patch_index;
      loop$path = path2;
      loop$changes = changes;
      loop$children = children2;
      loop$mapper = mapper;
      loop$events = events$1;
    } else {
      let prev = old.head;
      let next = new$10.head;
      if (prev.key !== next.key) {
        let old_remaining = old.tail;
        let new_remaining = new$10.tail;
        let next_did_exist = get(old_keyed, next.key);
        let prev_does_exist = has_key2(new_keyed, prev.key);
        if (prev_does_exist) {
          if (next_did_exist instanceof Ok) {
            let match = next_did_exist[0];
            let $ = has_key2(moved, prev.key);
            if ($) {
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new$10;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset - 1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$path = path2;
              loop$changes = changes;
              loop$children = children2;
              loop$mapper = mapper;
              loop$events = events;
            } else {
              let before = node_index - moved_offset;
              let changes$1 = prepend(
                move(next.key, before),
                changes
              );
              let moved$1 = insert2(moved, next.key, void 0);
              let moved_offset$1 = moved_offset + 1;
              loop$old = prepend(match, old);
              loop$old_keyed = old_keyed;
              loop$new = new$10;
              loop$new_keyed = new_keyed;
              loop$moved = moved$1;
              loop$moved_offset = moved_offset$1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$path = path2;
              loop$changes = changes$1;
              loop$children = children2;
              loop$mapper = mapper;
              loop$events = events;
            }
          } else {
            let before = node_index - moved_offset;
            let events$1 = add_child(
              events,
              mapper,
              path2,
              node_index,
              next
            );
            let insert4 = insert3(toList([next]), before);
            let changes$1 = prepend(insert4, changes);
            loop$old = old;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset + 1;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = changes$1;
            loop$children = children2;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else if (next_did_exist instanceof Ok) {
          let index4 = node_index - moved_offset;
          let changes$1 = prepend(remove2(index4), changes);
          let events$1 = remove_child(events, path2, node_index, prev);
          let moved_offset$1 = moved_offset - 1;
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new$10;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset$1;
          loop$removed = removed;
          loop$node_index = node_index;
          loop$patch_index = patch_index;
          loop$path = path2;
          loop$changes = changes$1;
          loop$children = children2;
          loop$mapper = mapper;
          loop$events = events$1;
        } else {
          let change = replace2(node_index - moved_offset, next);
          let _block;
          let _pipe = events;
          let _pipe$1 = remove_child(_pipe, path2, node_index, prev);
          _block = add_child(_pipe$1, mapper, path2, node_index, next);
          let events$1 = _block;
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new_remaining;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset;
          loop$removed = removed;
          loop$node_index = node_index + 1;
          loop$patch_index = patch_index;
          loop$path = path2;
          loop$changes = prepend(change, changes);
          loop$children = children2;
          loop$mapper = mapper;
          loop$events = events$1;
        }
      } else {
        let $ = old.head;
        if ($ instanceof Fragment) {
          let $1 = new$10.head;
          if ($1 instanceof Fragment) {
            let prev$1 = $;
            let old$1 = old.tail;
            let next$1 = $1;
            let new$1 = new$10.tail;
            let composed_mapper = compose_mapper(mapper, next$1.mapper);
            let child_path = add2(path2, node_index, next$1.key);
            let child = do_diff(
              prev$1.children,
              prev$1.keyed_children,
              next$1.children,
              next$1.keyed_children,
              empty2(),
              0,
              0,
              0,
              node_index,
              child_path,
              empty_list,
              empty_list,
              composed_mapper,
              events
            );
            let _block;
            let $2 = child.patch;
            let $3 = $2.changes;
            if ($3 instanceof Empty) {
              let $4 = $2.children;
              if ($4 instanceof Empty) {
                let $5 = $2.removed;
                if ($5 === 0) {
                  _block = children2;
                } else {
                  _block = prepend(child.patch, children2);
                }
              } else {
                _block = prepend(child.patch, children2);
              }
            } else {
              _block = prepend(child.patch, children2);
            }
            let children$1 = _block;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = changes;
            loop$children = children$1;
            loop$mapper = mapper;
            loop$events = child.events;
          } else {
            let prev$1 = $;
            let old_remaining = old.tail;
            let next$1 = $1;
            let new_remaining = new$10.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path2, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path2,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = prepend(change, changes);
            loop$children = children2;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else if ($ instanceof Element) {
          let $1 = new$10.head;
          if ($1 instanceof Element) {
            let prev$1 = $;
            let next$1 = $1;
            if (prev$1.namespace === next$1.namespace && prev$1.tag === next$1.tag) {
              let old$1 = old.tail;
              let new$1 = new$10.tail;
              let composed_mapper = compose_mapper(
                mapper,
                next$1.mapper
              );
              let child_path = add2(path2, node_index, next$1.key);
              let controlled2 = is_controlled(
                events,
                next$1.namespace,
                next$1.tag,
                child_path
              );
              let $2 = diff_attributes(
                controlled2,
                child_path,
                composed_mapper,
                events,
                prev$1.attributes,
                next$1.attributes,
                empty_list,
                empty_list
              );
              let added_attrs;
              let removed_attrs;
              let events$1;
              added_attrs = $2.added;
              removed_attrs = $2.removed;
              events$1 = $2.events;
              let _block;
              if (added_attrs instanceof Empty && removed_attrs instanceof Empty) {
                _block = empty_list;
              } else {
                _block = toList([update(added_attrs, removed_attrs)]);
              }
              let initial_child_changes = _block;
              let child = do_diff(
                prev$1.children,
                prev$1.keyed_children,
                next$1.children,
                next$1.keyed_children,
                empty2(),
                0,
                0,
                0,
                node_index,
                child_path,
                initial_child_changes,
                empty_list,
                composed_mapper,
                events$1
              );
              let _block$1;
              let $3 = child.patch;
              let $4 = $3.changes;
              if ($4 instanceof Empty) {
                let $5 = $3.children;
                if ($5 instanceof Empty) {
                  let $6 = $3.removed;
                  if ($6 === 0) {
                    _block$1 = children2;
                  } else {
                    _block$1 = prepend(child.patch, children2);
                  }
                } else {
                  _block$1 = prepend(child.patch, children2);
                }
              } else {
                _block$1 = prepend(child.patch, children2);
              }
              let children$1 = _block$1;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path2;
              loop$changes = changes;
              loop$children = children$1;
              loop$mapper = mapper;
              loop$events = child.events;
            } else {
              let prev$2 = $;
              let old_remaining = old.tail;
              let next$2 = $1;
              let new_remaining = new$10.tail;
              let change = replace2(node_index - moved_offset, next$2);
              let _block;
              let _pipe = events;
              let _pipe$1 = remove_child(
                _pipe,
                path2,
                node_index,
                prev$2
              );
              _block = add_child(
                _pipe$1,
                mapper,
                path2,
                node_index,
                next$2
              );
              let events$1 = _block;
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new_remaining;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path2;
              loop$changes = prepend(change, changes);
              loop$children = children2;
              loop$mapper = mapper;
              loop$events = events$1;
            }
          } else {
            let prev$1 = $;
            let old_remaining = old.tail;
            let next$1 = $1;
            let new_remaining = new$10.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path2, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path2,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = prepend(change, changes);
            loop$children = children2;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else if ($ instanceof Text) {
          let $1 = new$10.head;
          if ($1 instanceof Text) {
            let prev$1 = $;
            let next$1 = $1;
            if (prev$1.content === next$1.content) {
              let old$1 = old.tail;
              let new$1 = new$10.tail;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path2;
              loop$changes = changes;
              loop$children = children2;
              loop$mapper = mapper;
              loop$events = events;
            } else {
              let old$1 = old.tail;
              let next$2 = $1;
              let new$1 = new$10.tail;
              let child = new$5(
                node_index,
                0,
                toList([replace_text(next$2.content)]),
                empty_list
              );
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path2;
              loop$changes = changes;
              loop$children = prepend(child, children2);
              loop$mapper = mapper;
              loop$events = events;
            }
          } else {
            let prev$1 = $;
            let old_remaining = old.tail;
            let next$1 = $1;
            let new_remaining = new$10.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path2, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path2,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = prepend(change, changes);
            loop$children = children2;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else {
          let $1 = new$10.head;
          if ($1 instanceof UnsafeInnerHtml) {
            let prev$1 = $;
            let old$1 = old.tail;
            let next$1 = $1;
            let new$1 = new$10.tail;
            let composed_mapper = compose_mapper(mapper, next$1.mapper);
            let child_path = add2(path2, node_index, next$1.key);
            let $2 = diff_attributes(
              false,
              child_path,
              composed_mapper,
              events,
              prev$1.attributes,
              next$1.attributes,
              empty_list,
              empty_list
            );
            let added_attrs;
            let removed_attrs;
            let events$1;
            added_attrs = $2.added;
            removed_attrs = $2.removed;
            events$1 = $2.events;
            let _block;
            if (added_attrs instanceof Empty && removed_attrs instanceof Empty) {
              _block = empty_list;
            } else {
              _block = toList([update(added_attrs, removed_attrs)]);
            }
            let child_changes = _block;
            let _block$1;
            let $3 = prev$1.inner_html === next$1.inner_html;
            if ($3) {
              _block$1 = child_changes;
            } else {
              _block$1 = prepend(
                replace_inner_html(next$1.inner_html),
                child_changes
              );
            }
            let child_changes$1 = _block$1;
            let _block$2;
            if (child_changes$1 instanceof Empty) {
              _block$2 = children2;
            } else {
              _block$2 = prepend(
                new$5(node_index, 0, child_changes$1, toList([])),
                children2
              );
            }
            let children$1 = _block$2;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = changes;
            loop$children = children$1;
            loop$mapper = mapper;
            loop$events = events$1;
          } else {
            let prev$1 = $;
            let old_remaining = old.tail;
            let next$1 = $1;
            let new_remaining = new$10.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path2, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path2,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path2;
            loop$changes = prepend(change, changes);
            loop$children = children2;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        }
      }
    }
  }
}
function diff(events, old, new$10) {
  return do_diff(
    toList([old]),
    empty2(),
    toList([new$10]),
    empty2(),
    empty2(),
    0,
    0,
    0,
    0,
    root2,
    empty_list,
    empty_list,
    identity2,
    tick(events)
  );
}

// build/dev/javascript/lustre/lustre/vdom/reconciler.ffi.mjs
var setTimeout = globalThis.setTimeout;
var clearTimeout = globalThis.clearTimeout;
var createElementNS = (ns, name2) => document2().createElementNS(ns, name2);
var createTextNode = (data2) => document2().createTextNode(data2);
var createDocumentFragment = () => document2().createDocumentFragment();
var insertBefore = (parent, node2, reference) => parent.insertBefore(node2, reference);
var moveBefore = SUPPORTS_MOVE_BEFORE ? (parent, node2, reference) => parent.moveBefore(node2, reference) : insertBefore;
var removeChild = (parent, child) => parent.removeChild(child);
var getAttribute = (node2, name2) => node2.getAttribute(name2);
var setAttribute = (node2, name2, value) => node2.setAttribute(name2, value);
var removeAttribute = (node2, name2) => node2.removeAttribute(name2);
var addEventListener = (node2, name2, handler2, options7) => node2.addEventListener(name2, handler2, options7);
var removeEventListener = (node2, name2, handler2) => node2.removeEventListener(name2, handler2);
var setInnerHtml = (node2, innerHtml) => node2.innerHTML = innerHtml;
var setData = (node2, data2) => node2.data = data2;
var meta = Symbol("lustre");
var MetadataNode = class {
  constructor(kind, parent, node2, key) {
    this.kind = kind;
    this.key = key;
    this.parent = parent;
    this.children = [];
    this.node = node2;
    this.handlers = /* @__PURE__ */ new Map();
    this.throttles = /* @__PURE__ */ new Map();
    this.debouncers = /* @__PURE__ */ new Map();
  }
  get parentNode() {
    return this.kind === fragment_kind ? this.node.parentNode : this.node;
  }
};
var insertMetadataChild = (kind, parent, node2, index4, key) => {
  const child = new MetadataNode(kind, parent, node2, key);
  node2[meta] = child;
  parent?.children.splice(index4, 0, child);
  return child;
};
var getPath = (node2) => {
  let path2 = "";
  for (let current = node2[meta]; current.parent; current = current.parent) {
    if (current.key) {
      path2 = `${separator_element}${current.key}${path2}`;
    } else {
      const index4 = current.parent.children.indexOf(current);
      path2 = `${separator_element}${index4}${path2}`;
    }
  }
  return path2.slice(1);
};
var Reconciler = class {
  #root = null;
  #dispatch = () => {
  };
  #useServerEvents = false;
  #exposeKeys = false;
  constructor(root9, dispatch, { useServerEvents = false, exposeKeys = false } = {}) {
    this.#root = root9;
    this.#dispatch = dispatch;
    this.#useServerEvents = useServerEvents;
    this.#exposeKeys = exposeKeys;
  }
  mount(vdom) {
    insertMetadataChild(element_kind, null, this.#root, 0, null);
    this.#insertChild(this.#root, null, this.#root[meta], 0, vdom);
  }
  push(patch) {
    this.#stack.push({ node: this.#root[meta], patch });
    this.#reconcile();
  }
  // PATCHING ------------------------------------------------------------------
  #stack = [];
  #reconcile() {
    const stack = this.#stack;
    while (stack.length) {
      const { node: node2, patch } = stack.pop();
      const { children: childNodes } = node2;
      const { changes, removed, children: childPatches } = patch;
      iterate(changes, (change) => this.#patch(node2, change));
      if (removed) {
        this.#removeChildren(node2, childNodes.length - removed, removed);
      }
      iterate(childPatches, (childPatch) => {
        const child = childNodes[childPatch.index | 0];
        this.#stack.push({ node: child, patch: childPatch });
      });
    }
  }
  #patch(node2, change) {
    switch (change.kind) {
      case replace_text_kind:
        this.#replaceText(node2, change);
        break;
      case replace_inner_html_kind:
        this.#replaceInnerHtml(node2, change);
        break;
      case update_kind:
        this.#update(node2, change);
        break;
      case move_kind:
        this.#move(node2, change);
        break;
      case remove_kind:
        this.#remove(node2, change);
        break;
      case replace_kind:
        this.#replace(node2, change);
        break;
      case insert_kind:
        this.#insert(node2, change);
        break;
    }
  }
  // CHANGES -------------------------------------------------------------------
  #insert(parent, { children: children2, before }) {
    const fragment4 = createDocumentFragment();
    const beforeEl = this.#getReference(parent, before);
    this.#insertChildren(fragment4, null, parent, before | 0, children2);
    insertBefore(parent.parentNode, fragment4, beforeEl);
  }
  #replace(parent, { index: index4, with: child }) {
    this.#removeChildren(parent, index4 | 0, 1);
    const beforeEl = this.#getReference(parent, index4);
    this.#insertChild(parent.parentNode, beforeEl, parent, index4 | 0, child);
  }
  #getReference(node2, index4) {
    index4 = index4 | 0;
    const { children: children2 } = node2;
    const childCount = children2.length;
    if (index4 < childCount) {
      return children2[index4].node;
    }
    let lastChild = children2[childCount - 1];
    if (!lastChild && node2.kind !== fragment_kind) return null;
    if (!lastChild) lastChild = node2;
    while (lastChild.kind === fragment_kind && lastChild.children.length) {
      lastChild = lastChild.children[lastChild.children.length - 1];
    }
    return lastChild.node.nextSibling;
  }
  #move(parent, { key, before }) {
    before = before | 0;
    const { children: children2, parentNode } = parent;
    const beforeEl = children2[before].node;
    let prev = children2[before];
    for (let i = before + 1; i < children2.length; ++i) {
      const next = children2[i];
      children2[i] = prev;
      prev = next;
      if (next.key === key) {
        children2[before] = next;
        break;
      }
    }
    const { kind, node: node2, children: prevChildren } = prev;
    moveBefore(parentNode, node2, beforeEl);
    if (kind === fragment_kind) {
      this.#moveChildren(parentNode, prevChildren, beforeEl);
    }
  }
  #moveChildren(domParent, children2, beforeEl) {
    for (let i = 0; i < children2.length; ++i) {
      const { kind, node: node2, children: nestedChildren } = children2[i];
      moveBefore(domParent, node2, beforeEl);
      if (kind === fragment_kind) {
        this.#moveChildren(domParent, nestedChildren, beforeEl);
      }
    }
  }
  #remove(parent, { index: index4 }) {
    this.#removeChildren(parent, index4, 1);
  }
  #removeChildren(parent, index4, count) {
    const { children: children2, parentNode } = parent;
    const deleted = children2.splice(index4, count);
    for (let i = 0; i < deleted.length; ++i) {
      const { kind, node: node2, children: nestedChildren } = deleted[i];
      removeChild(parentNode, node2);
      this.#removeDebouncers(deleted[i]);
      if (kind === fragment_kind) {
        deleted.push(...nestedChildren);
      }
    }
  }
  #removeDebouncers(node2) {
    const { debouncers, children: children2 } = node2;
    for (const { timeout } of debouncers.values()) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    debouncers.clear();
    iterate(children2, (child) => this.#removeDebouncers(child));
  }
  #update({ node: node2, handlers, throttles, debouncers }, { added, removed }) {
    iterate(removed, ({ name: name2 }) => {
      if (handlers.delete(name2)) {
        removeEventListener(node2, name2, handleEvent);
        this.#updateDebounceThrottle(throttles, name2, 0);
        this.#updateDebounceThrottle(debouncers, name2, 0);
      } else {
        removeAttribute(node2, name2);
        SYNCED_ATTRIBUTES[name2]?.removed?.(node2, name2);
      }
    });
    iterate(added, (attribute4) => this.#createAttribute(node2, attribute4));
  }
  #replaceText({ node: node2 }, { content }) {
    setData(node2, content ?? "");
  }
  #replaceInnerHtml({ node: node2 }, { inner_html }) {
    setInnerHtml(node2, inner_html ?? "");
  }
  // INSERT --------------------------------------------------------------------
  #insertChildren(domParent, beforeEl, metaParent, index4, children2) {
    iterate(
      children2,
      (child) => this.#insertChild(domParent, beforeEl, metaParent, index4++, child)
    );
  }
  #insertChild(domParent, beforeEl, metaParent, index4, vnode) {
    switch (vnode.kind) {
      case element_kind: {
        const node2 = this.#createElement(metaParent, index4, vnode);
        this.#insertChildren(node2, null, node2[meta], 0, vnode.children);
        insertBefore(domParent, node2, beforeEl);
        break;
      }
      case text_kind: {
        const node2 = this.#createTextNode(metaParent, index4, vnode);
        insertBefore(domParent, node2, beforeEl);
        break;
      }
      case fragment_kind: {
        const head2 = this.#createTextNode(metaParent, index4, vnode);
        insertBefore(domParent, head2, beforeEl);
        this.#insertChildren(
          domParent,
          beforeEl,
          head2[meta],
          0,
          vnode.children
        );
        break;
      }
      case unsafe_inner_html_kind: {
        const node2 = this.#createElement(metaParent, index4, vnode);
        this.#replaceInnerHtml({ node: node2 }, vnode);
        insertBefore(domParent, node2, beforeEl);
        break;
      }
    }
  }
  #createElement(parent, index4, { kind, key, tag: tag8, namespace: namespace2, attributes }) {
    const node2 = createElementNS(namespace2 || NAMESPACE_HTML, tag8);
    insertMetadataChild(kind, parent, node2, index4, key);
    if (this.#exposeKeys && key) {
      setAttribute(node2, "data-lustre-key", key);
    }
    iterate(attributes, (attribute4) => this.#createAttribute(node2, attribute4));
    return node2;
  }
  #createTextNode(parent, index4, { kind, key, content }) {
    const node2 = createTextNode(content ?? "");
    insertMetadataChild(kind, parent, node2, index4, key);
    return node2;
  }
  #createAttribute(node2, attribute4) {
    const { debouncers, handlers, throttles } = node2[meta];
    const {
      kind,
      name: name2,
      value,
      prevent_default: prevent,
      debounce: debounceDelay,
      throttle: throttleDelay
    } = attribute4;
    switch (kind) {
      case attribute_kind: {
        const valueOrDefault = value ?? "";
        if (name2 === "virtual:defaultValue") {
          node2.defaultValue = valueOrDefault;
          return;
        }
        if (valueOrDefault !== getAttribute(node2, name2)) {
          setAttribute(node2, name2, valueOrDefault);
        }
        SYNCED_ATTRIBUTES[name2]?.added?.(node2, valueOrDefault);
        break;
      }
      case property_kind:
        node2[name2] = value;
        break;
      case event_kind: {
        if (handlers.has(name2)) {
          removeEventListener(node2, name2, handleEvent);
        }
        const passive = prevent.kind === never_kind;
        addEventListener(node2, name2, handleEvent, { passive });
        this.#updateDebounceThrottle(throttles, name2, throttleDelay);
        this.#updateDebounceThrottle(debouncers, name2, debounceDelay);
        handlers.set(name2, (event4) => this.#handleEvent(attribute4, event4));
        break;
      }
    }
  }
  #updateDebounceThrottle(map4, name2, delay) {
    const debounceOrThrottle = map4.get(name2);
    if (delay > 0) {
      if (debounceOrThrottle) {
        debounceOrThrottle.delay = delay;
      } else {
        map4.set(name2, { delay });
      }
    } else if (debounceOrThrottle) {
      const { timeout } = debounceOrThrottle;
      if (timeout) {
        clearTimeout(timeout);
      }
      map4.delete(name2);
    }
  }
  #handleEvent(attribute4, event4) {
    const { currentTarget, type } = event4;
    const { debouncers, throttles } = currentTarget[meta];
    const path2 = getPath(currentTarget);
    const {
      prevent_default: prevent,
      stop_propagation: stop2,
      include,
      immediate
    } = attribute4;
    if (prevent.kind === always_kind) event4.preventDefault();
    if (stop2.kind === always_kind) event4.stopPropagation();
    if (type === "submit") {
      event4.detail ??= {};
      event4.detail.formData = [
        ...new FormData(event4.target, event4.submitter).entries()
      ];
    }
    const data2 = this.#useServerEvents ? createServerEvent(event4, include ?? []) : event4;
    const throttle = throttles.get(type);
    if (throttle) {
      const now2 = Date.now();
      const last = throttle.last || 0;
      if (now2 > last + throttle.delay) {
        throttle.last = now2;
        throttle.lastEvent = event4;
        this.#dispatch(data2, path2, type, immediate);
      }
    }
    const debounce = debouncers.get(type);
    if (debounce) {
      clearTimeout(debounce.timeout);
      debounce.timeout = setTimeout(() => {
        if (event4 === throttles.get(type)?.lastEvent) return;
        this.#dispatch(data2, path2, type, immediate);
      }, debounce.delay);
    }
    if (!throttle && !debounce) {
      this.#dispatch(data2, path2, type, immediate);
    }
  }
};
var iterate = (list4, callback) => {
  if (Array.isArray(list4)) {
    for (let i = 0; i < list4.length; i++) {
      callback(list4[i]);
    }
  } else if (list4) {
    for (list4; list4.head; list4 = list4.tail) {
      callback(list4.head);
    }
  }
};
var handleEvent = (event4) => {
  const { currentTarget, type } = event4;
  const handler2 = currentTarget[meta].handlers.get(type);
  handler2(event4);
};
var createServerEvent = (event4, include = []) => {
  const data2 = {};
  if (event4.type === "input" || event4.type === "change") {
    include.push("target.value");
  }
  if (event4.type === "submit") {
    include.push("detail.formData");
  }
  for (const property3 of include) {
    const path2 = property3.split(".");
    for (let i = 0, input = event4, output = data2; i < path2.length; i++) {
      if (i === path2.length - 1) {
        output[path2[i]] = input[path2[i]];
        break;
      }
      output = output[path2[i]] ??= {};
      input = input[path2[i]];
    }
  }
  return data2;
};
var syncedBooleanAttribute = /* @__NO_SIDE_EFFECTS__ */ (name2) => {
  return {
    added(node2) {
      node2[name2] = true;
    },
    removed(node2) {
      node2[name2] = false;
    }
  };
};
var syncedAttribute = /* @__NO_SIDE_EFFECTS__ */ (name2) => {
  return {
    added(node2, value) {
      node2[name2] = value;
    }
  };
};
var SYNCED_ATTRIBUTES = {
  checked: /* @__PURE__ */ syncedBooleanAttribute("checked"),
  selected: /* @__PURE__ */ syncedBooleanAttribute("selected"),
  value: /* @__PURE__ */ syncedAttribute("value"),
  autofocus: {
    added(node2) {
      queueMicrotask(() => {
        node2.focus?.();
      });
    }
  },
  autoplay: {
    added(node2) {
      try {
        node2.play?.();
      } catch (e) {
        console.error(e);
      }
    }
  }
};

// build/dev/javascript/lustre/lustre/element/keyed.mjs
function do_extract_keyed_children(loop$key_children_pairs, loop$keyed_children, loop$children) {
  while (true) {
    let key_children_pairs = loop$key_children_pairs;
    let keyed_children = loop$keyed_children;
    let children2 = loop$children;
    if (key_children_pairs instanceof Empty) {
      return [keyed_children, reverse(children2)];
    } else {
      let rest = key_children_pairs.tail;
      let key = key_children_pairs.head[0];
      let element$1 = key_children_pairs.head[1];
      let keyed_element = to_keyed(key, element$1);
      let _block;
      if (key === "") {
        _block = keyed_children;
      } else {
        _block = insert2(keyed_children, key, keyed_element);
      }
      let keyed_children$1 = _block;
      let children$1 = prepend(keyed_element, children2);
      loop$key_children_pairs = rest;
      loop$keyed_children = keyed_children$1;
      loop$children = children$1;
    }
  }
}
function extract_keyed_children(children2) {
  return do_extract_keyed_children(
    children2,
    empty2(),
    empty_list
  );
}
function element3(tag8, attributes, children2) {
  let $ = extract_keyed_children(children2);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return element(
    "",
    identity2,
    "",
    tag8,
    attributes,
    children$1,
    keyed_children,
    false,
    false
  );
}
function namespaced2(namespace2, tag8, attributes, children2) {
  let $ = extract_keyed_children(children2);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return element(
    "",
    identity2,
    namespace2,
    tag8,
    attributes,
    children$1,
    keyed_children,
    false,
    false
  );
}
function fragment3(children2) {
  let $ = extract_keyed_children(children2);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return fragment("", identity2, children$1, keyed_children);
}

// build/dev/javascript/lustre/lustre/vdom/virtualise.ffi.mjs
var virtualise = (root9) => {
  const rootMeta = insertMetadataChild(element_kind, null, root9, 0, null);
  let virtualisableRootChildren = 0;
  for (let child = root9.firstChild; child; child = child.nextSibling) {
    if (canVirtualiseNode(child)) virtualisableRootChildren += 1;
  }
  if (virtualisableRootChildren === 0) {
    const placeholder = document2().createTextNode("");
    insertMetadataChild(text_kind, rootMeta, placeholder, 0, null);
    root9.replaceChildren(placeholder);
    return none2();
  }
  if (virtualisableRootChildren === 1) {
    const children3 = virtualiseChildNodes(rootMeta, root9);
    return children3.head[1];
  }
  const fragmentHead = document2().createTextNode("");
  const fragmentMeta = insertMetadataChild(fragment_kind, rootMeta, fragmentHead, 0, null);
  const children2 = virtualiseChildNodes(fragmentMeta, root9);
  root9.insertBefore(fragmentHead, root9.firstChild);
  return fragment3(children2);
};
var canVirtualiseNode = (node2) => {
  switch (node2.nodeType) {
    case ELEMENT_NODE:
      return true;
    case TEXT_NODE:
      return !!node2.data;
    default:
      return false;
  }
};
var virtualiseNode = (meta2, node2, key, index4) => {
  if (!canVirtualiseNode(node2)) {
    return null;
  }
  switch (node2.nodeType) {
    case ELEMENT_NODE: {
      const childMeta = insertMetadataChild(element_kind, meta2, node2, index4, key);
      const tag8 = node2.localName;
      const namespace2 = node2.namespaceURI;
      const isHtmlElement = !namespace2 || namespace2 === NAMESPACE_HTML;
      if (isHtmlElement && INPUT_ELEMENTS.includes(tag8)) {
        virtualiseInputEvents(tag8, node2);
      }
      const attributes = virtualiseAttributes(node2);
      const children2 = virtualiseChildNodes(childMeta, node2);
      const vnode = isHtmlElement ? element3(tag8, attributes, children2) : namespaced2(namespace2, tag8, attributes, children2);
      return vnode;
    }
    case TEXT_NODE:
      insertMetadataChild(text_kind, meta2, node2, index4, null);
      return text2(node2.data);
    default:
      return null;
  }
};
var INPUT_ELEMENTS = ["input", "select", "textarea"];
var virtualiseInputEvents = (tag8, node2) => {
  const value = node2.value;
  const checked = node2.checked;
  if (tag8 === "input" && node2.type === "checkbox" && !checked) return;
  if (tag8 === "input" && node2.type === "radio" && !checked) return;
  if (node2.type !== "checkbox" && node2.type !== "radio" && !value) return;
  queueMicrotask(() => {
    node2.value = value;
    node2.checked = checked;
    node2.dispatchEvent(new Event("input", { bubbles: true }));
    node2.dispatchEvent(new Event("change", { bubbles: true }));
    if (document2().activeElement !== node2) {
      node2.dispatchEvent(new Event("blur", { bubbles: true }));
    }
  });
};
var virtualiseChildNodes = (meta2, node2) => {
  let children2 = null;
  let child = node2.firstChild;
  let ptr = null;
  let index4 = 0;
  while (child) {
    const key = child.nodeType === ELEMENT_NODE ? child.getAttribute("data-lustre-key") : null;
    if (key != null) {
      child.removeAttribute("data-lustre-key");
    }
    const vnode = virtualiseNode(meta2, child, key, index4);
    const next = child.nextSibling;
    if (vnode) {
      const list_node = new NonEmpty([key ?? "", vnode], null);
      if (ptr) {
        ptr = ptr.tail = list_node;
      } else {
        ptr = children2 = list_node;
      }
      index4 += 1;
    } else {
      node2.removeChild(child);
    }
    child = next;
  }
  if (!ptr) return empty_list;
  ptr.tail = empty_list;
  return children2;
};
var virtualiseAttributes = (node2) => {
  let index4 = node2.attributes.length;
  let attributes = empty_list;
  while (index4-- > 0) {
    const attr = node2.attributes[index4];
    if (attr.name === "xmlns") {
      continue;
    }
    attributes = new NonEmpty(virtualiseAttribute(attr), attributes);
  }
  return attributes;
};
var virtualiseAttribute = (attr) => {
  const name2 = attr.localName;
  const value = attr.value;
  return attribute2(name2, value);
};

// build/dev/javascript/lustre/lustre/runtime/client/runtime.ffi.mjs
var is_browser = () => !!document2();
var Runtime = class {
  constructor(root9, [model, effects], view8, update11) {
    this.root = root9;
    this.#model = model;
    this.#view = view8;
    this.#update = update11;
    this.root.addEventListener("context-request", (event4) => {
      if (!(event4.context && event4.callback)) return;
      if (!this.#contexts.has(event4.context)) return;
      event4.stopImmediatePropagation();
      const context = this.#contexts.get(event4.context);
      if (event4.subscribe) {
        const unsubscribe = () => {
          context.subscribers = context.subscribers.filter(
            (subscriber) => subscriber !== event4.callback
          );
        };
        context.subscribers.push([event4.callback, unsubscribe]);
        event4.callback(context.value, unsubscribe);
      } else {
        event4.callback(context.value);
      }
    });
    this.#reconciler = new Reconciler(this.root, (event4, path2, name2) => {
      const [events, result] = handle(this.#events, path2, name2, event4);
      this.#events = events;
      if (result.isOk()) {
        const handler2 = result[0];
        if (handler2.stop_propagation) event4.stopPropagation();
        if (handler2.prevent_default) event4.preventDefault();
        this.dispatch(handler2.message, false);
      }
    });
    this.#vdom = virtualise(this.root);
    this.#events = new$3();
    this.#shouldFlush = true;
    this.#tick(effects);
  }
  // PUBLIC API ----------------------------------------------------------------
  root = null;
  dispatch(msg, immediate = false) {
    this.#shouldFlush ||= immediate;
    if (this.#shouldQueue) {
      this.#queue.push(msg);
    } else {
      const [model, effects] = this.#update(this.#model, msg);
      this.#model = model;
      this.#tick(effects);
    }
  }
  emit(event4, data2) {
    const target2 = this.root.host ?? this.root;
    target2.dispatchEvent(
      new CustomEvent(event4, {
        detail: data2,
        bubbles: true,
        composed: true
      })
    );
  }
  // Provide a context value for any child nodes that request it using the given
  // key. If the key already exists, any existing subscribers will be notified
  // of the change. Otherwise, we store the value and wait for any `context-request`
  // events to come in.
  provide(key, value) {
    if (!this.#contexts.has(key)) {
      this.#contexts.set(key, { value, subscribers: [] });
    } else {
      const context = this.#contexts.get(key);
      context.value = value;
      for (let i = context.subscribers.length - 1; i >= 0; i--) {
        const [subscriber, unsubscribe] = context.subscribers[i];
        if (!subscriber) {
          context.subscribers.splice(i, 1);
          continue;
        }
        subscriber(value, unsubscribe);
      }
    }
  }
  // PRIVATE API ---------------------------------------------------------------
  #model;
  #view;
  #update;
  #vdom;
  #events;
  #reconciler;
  #contexts = /* @__PURE__ */ new Map();
  #shouldQueue = false;
  #queue = [];
  #beforePaint = empty_list;
  #afterPaint = empty_list;
  #renderTimer = null;
  #shouldFlush = false;
  #actions = {
    dispatch: (msg, immediate) => this.dispatch(msg, immediate),
    emit: (event4, data2) => this.emit(event4, data2),
    select: () => {
    },
    root: () => this.root,
    provide: (key, value) => this.provide(key, value)
  };
  // A `#tick` is where we process effects and trigger any synchronous updates.
  // Once a tick has been processed a render will be scheduled if none is already.
  // p0
  #tick(effects) {
    this.#shouldQueue = true;
    while (true) {
      for (let list4 = effects.synchronous; list4.tail; list4 = list4.tail) {
        list4.head(this.#actions);
      }
      this.#beforePaint = listAppend(this.#beforePaint, effects.before_paint);
      this.#afterPaint = listAppend(this.#afterPaint, effects.after_paint);
      if (!this.#queue.length) break;
      [this.#model, effects] = this.#update(this.#model, this.#queue.shift());
    }
    this.#shouldQueue = false;
    if (this.#shouldFlush) {
      cancelAnimationFrame(this.#renderTimer);
      this.#render();
    } else if (!this.#renderTimer) {
      this.#renderTimer = requestAnimationFrame(() => {
        this.#render();
      });
    }
  }
  #render() {
    this.#shouldFlush = false;
    this.#renderTimer = null;
    const next = this.#view(this.#model);
    const { patch, events } = diff(this.#events, this.#vdom, next);
    this.#events = events;
    this.#vdom = next;
    this.#reconciler.push(patch);
    if (this.#beforePaint instanceof NonEmpty) {
      const effects = makeEffect(this.#beforePaint);
      this.#beforePaint = empty_list;
      queueMicrotask(() => {
        this.#shouldFlush = true;
        this.#tick(effects);
      });
    }
    if (this.#afterPaint instanceof NonEmpty) {
      const effects = makeEffect(this.#afterPaint);
      this.#afterPaint = empty_list;
      requestAnimationFrame(() => {
        this.#shouldFlush = true;
        this.#tick(effects);
      });
    }
  }
};
function makeEffect(synchronous) {
  return {
    synchronous,
    after_paint: empty_list,
    before_paint: empty_list
  };
}
function listAppend(a2, b) {
  if (a2 instanceof Empty) {
    return b;
  } else if (b instanceof Empty) {
    return a2;
  } else {
    return append2(a2, b);
  }
}
var copiedStyleSheets = /* @__PURE__ */ new WeakMap();
async function adoptStylesheets(shadowRoot) {
  const pendingParentStylesheets = [];
  for (const node2 of document2().querySelectorAll(
    "link[rel=stylesheet], style"
  )) {
    if (node2.sheet) continue;
    pendingParentStylesheets.push(
      new Promise((resolve, reject) => {
        node2.addEventListener("load", resolve);
        node2.addEventListener("error", reject);
      })
    );
  }
  await Promise.allSettled(pendingParentStylesheets);
  if (!shadowRoot.host.isConnected) {
    return [];
  }
  shadowRoot.adoptedStyleSheets = shadowRoot.host.getRootNode().adoptedStyleSheets;
  const pending = [];
  for (const sheet of document2().styleSheets) {
    try {
      shadowRoot.adoptedStyleSheets.push(sheet);
    } catch {
      try {
        let copiedSheet = copiedStyleSheets.get(sheet);
        if (!copiedSheet) {
          copiedSheet = new CSSStyleSheet();
          for (const rule of sheet.cssRules) {
            copiedSheet.insertRule(rule.cssText, copiedSheet.cssRules.length);
          }
          copiedStyleSheets.set(sheet, copiedSheet);
        }
        shadowRoot.adoptedStyleSheets.push(copiedSheet);
      } catch {
        const node2 = sheet.ownerNode.cloneNode();
        shadowRoot.prepend(node2);
        pending.push(node2);
      }
    }
  }
  return pending;
}
var ContextRequestEvent = class extends Event {
  constructor(context, callback, subscribe) {
    super("context-request", { bubbles: true, composed: true });
    this.context = context;
    this.callback = callback;
    this.subscribe = subscribe;
  }
};

// build/dev/javascript/lustre/lustre/runtime/server/runtime.mjs
var EffectDispatchedMessage = class extends CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
};
var EffectEmitEvent = class extends CustomType {
  constructor(name2, data2) {
    super();
    this.name = name2;
    this.data = data2;
  }
};
var SystemRequestedShutdown = class extends CustomType {
};

// build/dev/javascript/lustre/lustre/runtime/client/component.ffi.mjs
var make_component = ({ init: init10, update: update11, view: view8, config }, name2) => {
  if (!is_browser()) return new Error(new NotABrowser());
  if (!name2.includes("-")) return new Error(new BadComponentName(name2));
  if (customElements.get(name2)) {
    return new Error(new ComponentAlreadyRegistered(name2));
  }
  const attributes = /* @__PURE__ */ new Map();
  const observedAttributes = [];
  for (let attr = config.attributes; attr.tail; attr = attr.tail) {
    const [name3, decoder3] = attr.head;
    if (attributes.has(name3)) continue;
    attributes.set(name3, decoder3);
    observedAttributes.push(name3);
  }
  const [model, effects] = init10(void 0);
  const component2 = class Component extends HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }
    static formAssociated = config.is_form_associated;
    #runtime;
    #adoptedStyleNodes = [];
    #shadowRoot;
    #contextSubscriptions = /* @__PURE__ */ new Map();
    constructor() {
      super();
      this.internals = this.attachInternals();
      if (!this.internals.shadowRoot) {
        this.#shadowRoot = this.attachShadow({
          mode: config.open_shadow_root ? "open" : "closed",
          delegatesFocus: config.delegates_focus
        });
      } else {
        this.#shadowRoot = this.internals.shadowRoot;
      }
      if (config.adopt_styles) {
        this.#adoptStyleSheets();
      }
      this.#runtime = new Runtime(
        this.#shadowRoot,
        [model, effects],
        view8,
        update11
      );
    }
    // CUSTOM ELEMENT LIFECYCLE METHODS ----------------------------------------
    connectedCallback() {
      const requested = /* @__PURE__ */ new Set();
      for (let ctx = config.contexts; ctx.tail; ctx = ctx.tail) {
        const [key, decoder3] = ctx.head;
        if (!key) continue;
        if (requested.has(key)) continue;
        this.dispatchEvent(
          new ContextRequestEvent(
            key,
            (value, unsubscribe) => {
              const previousUnsubscribe = this.#contextSubscriptions.get(key);
              if (previousUnsubscribe !== unsubscribe) {
                previousUnsubscribe?.();
              }
              const decoded = run(value, decoder3);
              this.#contextSubscriptions.set(key, unsubscribe);
              if (decoded.isOk()) {
                this.dispatch(decoded[0]);
              }
            },
            true
          )
        );
        requested.add(key);
      }
    }
    adoptedCallback() {
      if (config.adopt_styles) {
        this.#adoptStyleSheets();
      }
    }
    attributeChangedCallback(name3, _, value) {
      const decoded = attributes.get(name3)(value ?? "");
      if (decoded.isOk()) {
        this.dispatch(decoded[0]);
      }
    }
    formResetCallback() {
      if (config.on_form_reset instanceof Some) {
        this.dispatch(config.on_form_reset[0]);
      }
    }
    formStateRestoreCallback(state, reason) {
      switch (reason) {
        case "restore":
          if (config.on_form_restore instanceof Some) {
            this.dispatch(config.on_form_restore[0](state));
          }
          break;
        case "autocomplete":
          if (config.on_form_populate instanceof Some) {
            this.dispatch(config.on_form_autofill[0](state));
          }
          break;
      }
    }
    disconnectedCallback() {
      for (const [_, unsubscribe] of this.#contextSubscriptions) {
        unsubscribe?.();
      }
      this.#contextSubscriptions.clear();
    }
    // LUSTRE RUNTIME METHODS --------------------------------------------------
    send(message) {
      switch (message.constructor) {
        case EffectDispatchedMessage: {
          this.dispatch(message.message, false);
          break;
        }
        case EffectEmitEvent: {
          this.emit(message.name, message.data);
          break;
        }
        case SystemRequestedShutdown:
          break;
      }
    }
    dispatch(msg, immediate = false) {
      this.#runtime.dispatch(msg, immediate);
    }
    emit(event4, data2) {
      this.#runtime.emit(event4, data2);
    }
    provide(key, value) {
      this.#runtime.provide(key, value);
    }
    async #adoptStyleSheets() {
      while (this.#adoptedStyleNodes.length) {
        this.#adoptedStyleNodes.pop().remove();
        this.shadowRoot.firstChild.remove();
      }
      this.#adoptedStyleNodes = await adoptStylesheets(this.#shadowRoot);
    }
  };
  for (let prop = config.properties; prop.tail; prop = prop.tail) {
    const [name3, decoder3] = prop.head;
    if (Object.hasOwn(component2.prototype, name3)) {
      continue;
    }
    Object.defineProperty(component2.prototype, name3, {
      get() {
        return this[`_${name3}`];
      },
      set(value) {
        this[`_${name3}`] = value;
        const decoded = run(value, decoder3);
        if (decoded.constructor === Ok) {
          this.dispatch(decoded[0]);
        }
      }
    });
  }
  customElements.define(name2, component2);
  return new Ok(void 0);
};
var set_pseudo_state = (root9, value) => {
  if (!is_browser()) return;
  if (root9 instanceof ShadowRoot) {
    root9.host.internals.states.add(value);
  }
};
var remove_pseudo_state = (root9, value) => {
  if (!is_browser()) return;
  if (root9 instanceof ShadowRoot) {
    root9.host.internals.states.delete(value);
  }
};

// build/dev/javascript/lustre/lustre/component.mjs
var Config2 = class extends CustomType {
  constructor(open_shadow_root, adopt_styles2, delegates_focus, attributes, properties, contexts, is_form_associated, on_form_autofill, on_form_reset, on_form_restore) {
    super();
    this.open_shadow_root = open_shadow_root;
    this.adopt_styles = adopt_styles2;
    this.delegates_focus = delegates_focus;
    this.attributes = attributes;
    this.properties = properties;
    this.contexts = contexts;
    this.is_form_associated = is_form_associated;
    this.on_form_autofill = on_form_autofill;
    this.on_form_reset = on_form_reset;
    this.on_form_restore = on_form_restore;
  }
};
var Option = class extends CustomType {
  constructor(apply) {
    super();
    this.apply = apply;
  }
};
function new$6(options7) {
  let init10 = new Config2(
    true,
    true,
    false,
    empty_list,
    empty_list,
    empty_list,
    false,
    option_none,
    option_none,
    option_none
  );
  return fold2(
    options7,
    init10,
    (config, option) => {
      return option.apply(config);
    }
  );
}
function on_attribute_change(name2, decoder3) {
  return new Option(
    (config) => {
      let attributes = prepend([name2, decoder3], config.attributes);
      return new Config2(
        config.open_shadow_root,
        config.adopt_styles,
        config.delegates_focus,
        attributes,
        config.properties,
        config.contexts,
        config.is_form_associated,
        config.on_form_autofill,
        config.on_form_reset,
        config.on_form_restore
      );
    }
  );
}
function on_property_change(name2, decoder3) {
  return new Option(
    (config) => {
      let properties = prepend([name2, decoder3], config.properties);
      return new Config2(
        config.open_shadow_root,
        config.adopt_styles,
        config.delegates_focus,
        config.attributes,
        properties,
        config.contexts,
        config.is_form_associated,
        config.on_form_autofill,
        config.on_form_reset,
        config.on_form_restore
      );
    }
  );
}
function on_context_change(key, decoder3) {
  return new Option(
    (config) => {
      let contexts = prepend([key, decoder3], config.contexts);
      return new Config2(
        config.open_shadow_root,
        config.adopt_styles,
        config.delegates_focus,
        config.attributes,
        config.properties,
        contexts,
        config.is_form_associated,
        config.on_form_autofill,
        config.on_form_reset,
        config.on_form_restore
      );
    }
  );
}
function adopt_styles(adopt) {
  return new Option(
    (config) => {
      return new Config2(
        config.open_shadow_root,
        adopt,
        config.delegates_focus,
        config.attributes,
        config.properties,
        config.contexts,
        config.is_form_associated,
        config.on_form_autofill,
        config.on_form_reset,
        config.on_form_restore
      );
    }
  );
}
function default_slot(attributes, fallback) {
  return slot(attributes, fallback);
}
function named_slot(name2, attributes, fallback) {
  return slot(prepend(attribute2("name", name2), attributes), fallback);
}
function slot2(name2) {
  return attribute2("slot", name2);
}
function set_pseudo_state2(value) {
  return before_paint(
    (_, root9) => {
      return set_pseudo_state(root9, value);
    }
  );
}
function remove_pseudo_state2(value) {
  return before_paint(
    (_, root9) => {
      return remove_pseudo_state(root9, value);
    }
  );
}

// build/dev/javascript/lustre/lustre/runtime/client/spa.ffi.mjs
var Spa = class {
  #runtime;
  constructor(root9, [init10, effects], update11, view8) {
    this.#runtime = new Runtime(root9, [init10, effects], view8, update11);
  }
  send(message) {
    switch (message.constructor) {
      case EffectDispatchedMessage: {
        this.dispatch(message.message, false);
        break;
      }
      case EffectEmitEvent: {
        this.emit(message.name, message.data);
        break;
      }
      case SystemRequestedShutdown:
        break;
    }
  }
  dispatch(msg, immediate) {
    this.#runtime.dispatch(msg, immediate);
  }
  emit(event4, data2) {
    this.#runtime.emit(event4, data2);
  }
};
var start = ({ init: init10, update: update11, view: view8 }, selector, flags) => {
  if (!is_browser()) return new Error(new NotABrowser());
  const root9 = selector instanceof HTMLElement ? selector : document2().querySelector(selector);
  if (!root9) return new Error(new ElementNotFound(selector));
  return new Ok(new Spa(root9, init10(flags), update11, view8));
};

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init10, update11, view8, config) {
    super();
    this.init = init10;
    this.update = update11;
    this.view = view8;
    this.config = config;
  }
};
var BadComponentName = class extends CustomType {
  constructor(name2) {
    super();
    this.name = name2;
  }
};
var ComponentAlreadyRegistered = class extends CustomType {
  constructor(name2) {
    super();
    this.name = name2;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function component(init10, update11, view8, options7) {
  return new App(init10, update11, view8, new$6(options7));
}
function application(init10, update11, view8) {
  return new App(init10, update11, view8, new$6(empty_list));
}
function simple(init10, update11, view8) {
  let init$1 = (start_args) => {
    return [init10(start_args), none()];
  };
  let update$1 = (model, msg) => {
    return [update11(model, msg), none()];
  };
  return application(init$1, update$1, view8);
}
function start3(app, selector, start_args) {
  return guard(
    !is_browser(),
    new Error(new NotABrowser()),
    () => {
      return start(app, selector, start_args);
    }
  );
}

// build/dev/javascript/lustre/lustre/element/svg.mjs
var namespace = "http://www.w3.org/2000/svg";
function circle(attrs) {
  return namespaced(namespace, "circle", attrs, empty_list);
}
function rect(attrs) {
  return namespaced(namespace, "rect", attrs, empty_list);
}
function pattern(attrs, children2) {
  return namespaced(namespace, "pattern", attrs, children2);
}
function path(attrs) {
  return namespaced(namespace, "path", attrs, empty_list);
}

// build/dev/javascript/clique/clique/bounds.mjs
function init() {
  return [0, 0, 0, 0];
}
function to_json4(bounds) {
  return preprocessed_array(
    toList([
      float3(bounds[0]),
      float3(bounds[1]),
      float3(bounds[2]),
      float3(bounds[3])
    ])
  );
}

// build/dev/javascript/clique/clique/transform.mjs
function new$7(x, y, zoom) {
  return [x, y, zoom];
}
function init2() {
  return [0, 0, 1];
}
function decoder() {
  let tuple_decoder = field(
    0,
    float2,
    (x) => {
      return field(
        1,
        float2,
        (y) => {
          return field(
            2,
            float2,
            (zoom) => {
              return success([x, y, zoom]);
            }
          );
        }
      );
    }
  );
  let object_decoder = field(
    "x",
    float2,
    (x) => {
      return field(
        "y",
        float2,
        (y) => {
          return field(
            "zoom",
            float2,
            (zoom) => {
              return success([x, y, zoom]);
            }
          );
        }
      );
    }
  );
  return one_of(tuple_decoder, toList([object_decoder]));
}
function to_css_matrix(transform3) {
  return "matrix(" + float_to_string(transform3[2]) + ", 0, 0, " + float_to_string(
    transform3[2]
  ) + ", " + float_to_string(transform3[0]) + ", " + float_to_string(
    transform3[1]
  ) + ")";
}
function to_json5(transform3) {
  return preprocessed_array(
    toList([
      float3(transform3[0]),
      float3(transform3[1]),
      float3(transform3[2])
    ])
  );
}
function to_string4(transform3) {
  return float_to_string(transform3[0]) + " " + float_to_string(
    transform3[1]
  ) + " " + float_to_string(transform3[2]);
}

// build/dev/javascript/clique/clique/internal/context.mjs
function provide_scale(value) {
  return provide("clique/scale", float3(value));
}
function on_scale_change(handler2) {
  return on_context_change(
    "clique/scale",
    then$(
      float2,
      (scale) => {
        return success(handler2(scale));
      }
    )
  );
}
function provide_transform(value) {
  return provide("clique/transform", to_json5(value));
}
function on_transform_change(handler2) {
  return on_context_change(
    "clique/transform",
    then$(
      decoder(),
      (transform3) => {
        return success(handler2(transform3));
      }
    )
  );
}
function provide_connection(value) {
  return provide(
    "clique/connection",
    (() => {
      if (value instanceof Some) {
        let node2 = value[0][0];
        let handle2 = value[0][1];
        return object2(
          toList([
            ["node", string3(node2)],
            ["handle", string3(handle2)]
          ])
        );
      } else {
        return null$();
      }
    })()
  );
}
function on_connection_change(handler2) {
  return on_context_change(
    "clique/connection",
    then$(
      optional(
        field(
          "node",
          string2,
          (node2) => {
            return field(
              "handle",
              string2,
              (handle2) => {
                return success([node2, handle2]);
              }
            );
          }
        )
      ),
      (connection) => {
        return success(handler2(connection));
      }
    )
  );
}
function provide_handles(handles) {
  return provide(
    "clique/handles",
    object2(
      fold(
        handles,
        toList([]),
        (fields, node2, handles2) => {
          return fold(
            handles2,
            fields,
            (fields2, handle2, position2) => {
              let field2 = [
                node2 + "." + handle2,
                preprocessed_array(
                  toList([float3(position2[0]), float3(position2[1])])
                )
              ];
              return prepend(field2, fields2);
            }
          );
        }
      )
    )
  );
}
function on_handles_change(handler2) {
  return on_context_change(
    "clique/handles",
    then$(
      dict2(
        string2,
        field(
          0,
          float2,
          (x) => {
            return field(
              1,
              float2,
              (y) => {
                return success([x, y]);
              }
            );
          }
        )
      ),
      (raw_handles) => {
        return success(handler2(raw_handles));
      }
    )
  );
}

// build/dev/javascript/clique/clique/internal/number.mjs
function parse(value) {
  let $ = parse_int(value);
  if ($ instanceof Ok) {
    let n = $[0];
    return new Ok(identity(n));
  } else {
    return parse_float(value);
  }
}

// build/dev/javascript/clique/clique/background.ffi.mjs
var uuid = () => `background-${globalThis.crypto.randomUUID()}`;
var mod = (x, y) => x % y;

// build/dev/javascript/clique/clique/background.mjs
var Dots = class extends CustomType {
};
var Lines = class extends CustomType {
};
var Model = class extends CustomType {
  constructor(id2, pattern3, transform3, gap2, scaled_gap, size2, scaled_size, offset, scaled_offset) {
    super();
    this.id = id2;
    this.pattern = pattern3;
    this.transform = transform3;
    this.gap = gap2;
    this.scaled_gap = scaled_gap;
    this.size = size2;
    this.scaled_size = scaled_size;
    this.offset = offset;
    this.scaled_offset = scaled_offset;
  }
};
var ParentSetGap = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var ParentSetOffset = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var ParentSetPattern = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
var ParentSetSize = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
var ViewportProvidedTransform = class extends CustomType {
  constructor(transform3) {
    super();
    this.transform = transform3;
  }
};
function pattern2(value) {
  return attribute2(
    "pattern",
    (() => {
      if (value instanceof Dots) {
        return "dots";
      } else {
        return "lines";
      }
    })()
  );
}
function lines() {
  return pattern2(new Lines());
}
function gap(x, y) {
  let $ = is_browser();
  if ($) {
    return property2(
      "gap",
      object2(toList([["x", float3(x)], ["y", float3(y)]]))
    );
  } else {
    return attribute2("gap", float_to_string(x) + " " + float_to_string(y));
  }
}
function init3(_) {
  let model = new Model(
    uuid(),
    new Dots(),
    init2(),
    [20, 20],
    [20, 20],
    1,
    1,
    [0, 0],
    [0, 0]
  );
  let effect = none();
  return [model, effect];
}
function options() {
  return toList([
    adopt_styles(false),
    on_attribute_change(
      "pattern",
      (value) => {
        let $ = trim(value);
        if ($ === "dots") {
          return new Ok(new ParentSetPattern(new Dots()));
        } else if ($ === "lines") {
          return new Ok(new ParentSetPattern(new Lines()));
        } else {
          return new Error(void 0);
        }
      }
    ),
    on_attribute_change(
      "gap",
      (value) => {
        let $ = (() => {
          let _pipe = split2(value, " ");
          return map(_pipe, trim);
        })();
        if ($ instanceof Empty) {
          return new Error(void 0);
        } else {
          let $1 = $.tail;
          if ($1 instanceof Empty) {
            let gap$1 = $.head;
            let $2 = parse(gap$1);
            if ($2 instanceof Ok) {
              let value$1 = $2[0];
              return new Ok(new ParentSetGap(value$1, value$1));
            } else {
              return new Error(void 0);
            }
          } else {
            let $2 = $1.tail;
            if ($2 instanceof Empty) {
              let gap_x = $.head;
              let gap_y = $1.head;
              let $3 = parse(gap_x);
              let $4 = parse(gap_y);
              if ($3 instanceof Ok && $4 instanceof Ok) {
                let x = $3[0];
                let y = $4[0];
                return new Ok(new ParentSetGap(x, y));
              } else {
                return new Error(void 0);
              }
            } else {
              return new Error(void 0);
            }
          }
        }
      }
    ),
    on_property_change(
      "gap",
      field(
        "x",
        float2,
        (x) => {
          return field(
            "y",
            float2,
            (y) => {
              return success(new ParentSetGap(x, y));
            }
          );
        }
      )
    ),
    on_attribute_change(
      "offset",
      (value) => {
        let $ = (() => {
          let _pipe = split2(value, " ");
          return map(_pipe, trim);
        })();
        if ($ instanceof Empty) {
          return new Error(void 0);
        } else {
          let $1 = $.tail;
          if ($1 instanceof Empty) {
            let offset$1 = $.head;
            let $2 = parse(offset$1);
            if ($2 instanceof Ok) {
              let value$1 = $2[0];
              return new Ok(new ParentSetOffset(value$1, value$1));
            } else {
              return new Error(void 0);
            }
          } else {
            let $2 = $1.tail;
            if ($2 instanceof Empty) {
              let offset_x = $.head;
              let offset_y = $1.head;
              let $3 = parse(offset_x);
              let $4 = parse(offset_y);
              if ($3 instanceof Ok && $4 instanceof Ok) {
                let x = $3[0];
                let y = $4[0];
                return new Ok(new ParentSetOffset(x, y));
              } else {
                return new Error(void 0);
              }
            } else {
              return new Error(void 0);
            }
          }
        }
      }
    ),
    on_property_change(
      "offset",
      field(
        "x",
        float2,
        (x) => {
          return field(
            "y",
            float2,
            (y) => {
              return success(new ParentSetOffset(x, y));
            }
          );
        }
      )
    ),
    on_attribute_change(
      "size",
      (value) => {
        let $ = parse(value);
        if ($ instanceof Ok) {
          let n = $[0];
          return new Ok(new ParentSetSize(n));
        } else {
          return new Error(void 0);
        }
      }
    ),
    on_property_change(
      "size",
      (() => {
        let _pipe = float2;
        return map2(_pipe, (var0) => {
          return new ParentSetSize(var0);
        });
      })()
    ),
    on_transform_change(
      (var0) => {
        return new ViewportProvidedTransform(var0);
      }
    )
  ]);
}
function update2(model, msg) {
  if (msg instanceof ParentSetGap) {
    let x = msg.x;
    let y = msg.y;
    let gap$1 = [x, y];
    let scaled_gap = [x * model.transform[2], y * model.transform[2]];
    let model$1 = new Model(
      model.id,
      model.pattern,
      model.transform,
      gap$1,
      scaled_gap,
      model.size,
      model.scaled_size,
      model.offset,
      model.scaled_offset
    );
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetOffset) {
    let x = msg.x;
    let y = msg.y;
    let offset$1 = [x, y];
    let scaled_offset = [
      x * model.transform[2] + model.scaled_gap[0] / 2,
      y * model.transform[2] + model.scaled_gap[1] / 2
    ];
    let model$1 = new Model(
      model.id,
      model.pattern,
      model.transform,
      model.gap,
      model.scaled_gap,
      model.size,
      model.scaled_size,
      offset$1,
      scaled_offset
    );
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetPattern) {
    let value = msg.value;
    let model$1 = new Model(
      model.id,
      value,
      model.transform,
      model.gap,
      model.scaled_gap,
      model.size,
      model.scaled_size,
      model.offset,
      model.scaled_offset
    );
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetSize) {
    let value = msg.value;
    let size$1 = max(1, value);
    let scaled_size = size$1 * model.transform[2];
    let model$1 = new Model(
      model.id,
      model.pattern,
      model.transform,
      model.gap,
      model.scaled_gap,
      size$1,
      scaled_size,
      model.offset,
      model.scaled_offset
    );
    let effect = none();
    return [model$1, effect];
  } else {
    let transform3 = msg.transform;
    let scaled_gap = [model.gap[0] * transform3[2], model.gap[1] * transform3[2]];
    let scaled_size = model.size * transform3[2];
    let scaled_offset = [
      model.offset[0] * transform3[2] + scaled_gap[0] / 2,
      model.offset[1] * transform3[2] + scaled_gap[1] / 2
    ];
    let model$1 = new Model(
      model.id,
      model.pattern,
      transform3,
      model.gap,
      scaled_gap,
      model.size,
      scaled_size,
      model.offset,
      scaled_offset
    );
    let effect = none();
    return [model$1, effect];
  }
}
function view_pattern(id2, transform3, gap2, attributes, children2) {
  return pattern(
    prepend(
      id(id2),
      prepend(
        attribute2("x", float_to_string(mod(transform3[0], gap2[0]))),
        prepend(
          attribute2("y", float_to_string(mod(transform3[1], gap2[1]))),
          prepend(
            attribute2("width", float_to_string(gap2[0])),
            prepend(
              attribute2("height", float_to_string(gap2[1])),
              prepend(
                attribute2("patternUnits", "userSpaceOnUse"),
                attributes
              )
            )
          )
        )
      )
    ),
    children2
  );
}
function view_dot_pattern(radius) {
  return circle(
    toList([
      attribute2("cx", float_to_string(radius)),
      attribute2("cy", float_to_string(radius)),
      attribute2("r", float_to_string(radius))
    ])
  );
}
function view_line_pattern(dimensions) {
  let path2 = "M" + float_to_string(dimensions[0] / 2) + " 0 V" + float_to_string(
    dimensions[1]
  ) + " M0 " + float_to_string(dimensions[1] / 2) + " H" + float_to_string(
    dimensions[0]
  );
  return path(
    toList([attribute2("d", path2), attribute2("stroke-width", "1")])
  );
}
function view_background(id2) {
  return rect(
    toList([
      attribute2("x", "0"),
      attribute2("y", "0"),
      attribute2("width", "100%"),
      attribute2("height", "100%"),
      attribute2("fill", "url(#" + id2 + ")")
    ])
  );
}
function view(model) {
  return fragment2(
    toList([
      style2(
        toList([]),
        "\n      svg {\n        background-color: inherit;\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        overflow: visible;\n        pointer-events: none;\n      }\n\n      path {\n        stroke: currentcolor;\n        stroke-width: 1;\n      }\n\n      circle {\n        fill: currentcolor;\n      }\n      "
      ),
      svg(
        toList([]),
        toList([
          view_pattern(
            model.id,
            model.transform,
            model.scaled_gap,
            toList([
              attribute2(
                "patternTransform",
                (() => {
                  let $ = model.pattern;
                  if ($ instanceof Dots) {
                    return "translate(-" + float_to_string(
                      model.scaled_offset[0] + model.scaled_gap[0] / 2
                    ) + ", -" + float_to_string(
                      model.scaled_offset[1] + model.scaled_gap[1] / 2
                    ) + ") translate(-" + float_to_string(model.scaled_size) + ", -" + float_to_string(
                      model.scaled_size
                    ) + ")";
                  } else {
                    return "translate(-" + float_to_string(
                      model.scaled_offset[0]
                    ) + ", -" + float_to_string(model.scaled_offset[1]) + ")";
                  }
                })()
              )
            ]),
            toList([
              (() => {
                let $ = model.pattern;
                if ($ instanceof Dots) {
                  return view_dot_pattern(model.scaled_size);
                } else {
                  return view_line_pattern(model.scaled_gap);
                }
              })()
            ])
          ),
          view_background(model.id)
        ])
      )
    ])
  );
}
var tag = "clique-background";
function register() {
  return make_component(component(init3, update2, view, options()), tag);
}
function root3(attributes, children2) {
  return element2(tag, attributes, children2);
}

// build/dev/javascript/lustre/lustre/event.mjs
function emit2(event4, data2) {
  return event2(event4, data2);
}
function handler(message, prevent_default3, stop_propagation2) {
  return new Handler(prevent_default3, stop_propagation2, message);
}
function is_immediate_event(name2) {
  if (name2 === "input") {
    return true;
  } else if (name2 === "change") {
    return true;
  } else if (name2 === "focus") {
    return true;
  } else if (name2 === "focusin") {
    return true;
  } else if (name2 === "focusout") {
    return true;
  } else if (name2 === "blur") {
    return true;
  } else if (name2 === "select") {
    return true;
  } else {
    return false;
  }
}
function on(name2, handler2) {
  return event(
    name2,
    map2(handler2, (msg) => {
      return new Handler(false, false, msg);
    }),
    empty_list,
    never,
    never,
    is_immediate_event(name2),
    0,
    0
  );
}
function advanced(name2, handler2) {
  return event(
    name2,
    handler2,
    empty_list,
    possible,
    possible,
    is_immediate_event(name2),
    0,
    0
  );
}
function prevent_default(event4) {
  if (event4 instanceof Event2) {
    return new Event2(
      event4.kind,
      event4.name,
      event4.handler,
      event4.include,
      always,
      event4.stop_propagation,
      event4.immediate,
      event4.debounce,
      event4.throttle
    );
  } else {
    return event4;
  }
}
function on_click(msg) {
  return on("click", success(msg));
}

// build/dev/javascript/clique/clique/edge.mjs
var Model2 = class extends CustomType {
  constructor(from3, to2, kind) {
    super();
    this.from = from3;
    this.to = to2;
    this.kind = kind;
  }
};
var ParentRemovedFrom = class extends CustomType {
};
var ParentRemovedTo = class extends CustomType {
};
var ParentSetFrom = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
var ParentSetTo = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
var ParentSetType = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
function on_disconnect(handler2) {
  return on(
    "clique:disconnect",
    subfield(
      toList(["detail", "from"]),
      string2,
      (from3) => {
        return subfield(
          toList(["detail", "to"]),
          string2,
          (to2) => {
            return success(handler2(from3, to2));
          }
        );
      }
    )
  );
}
function emit_disconnect(from3, to2) {
  return emit2(
    "clique:disconnect",
    object2(
      toList([["from", string3(from3)], ["to", string3(to2)]])
    )
  );
}
function on_reconnect(handler2) {
  return on(
    "clique:reconnect",
    subfield(
      toList(["detail", "old"]),
      field(
        "from",
        string2,
        (from3) => {
          return field(
            "to",
            string2,
            (to2) => {
              return success([from3, to2]);
            }
          );
        }
      ),
      (old) => {
        return subfield(
          toList(["detail", "new"]),
          field(
            "from",
            string2,
            (from3) => {
              return field(
                "to",
                string2,
                (to2) => {
                  return success([from3, to2]);
                }
              );
            }
          ),
          (new$10) => {
            return subfield(
              toList(["detail", "type"]),
              string2,
              (kind) => {
                return success(handler2(old, new$10, kind));
              }
            );
          }
        );
      }
    )
  );
}
function emit_reconnect(old, new$10, new_kind) {
  return emit2(
    "clique:reconnect",
    object2(
      toList([
        [
          "old",
          object2(
            toList([
              ["from", string3(old[0])],
              ["to", string3(old[1])]
            ])
          )
        ],
        [
          "new",
          object2(
            toList([
              ["from", string3(new$10[0])],
              ["to", string3(new$10[1])]
            ])
          )
        ],
        ["type", string3(new_kind)]
      ])
    )
  );
}
function on_connect(handler2) {
  return on(
    "clique:connect",
    subfield(
      toList(["detail", "from"]),
      string2,
      (from3) => {
        return subfield(
          toList(["detail", "to"]),
          string2,
          (to2) => {
            return subfield(
              toList(["detail", "type"]),
              string2,
              (kind) => {
                return success(handler2(from3, to2, kind));
              }
            );
          }
        );
      }
    )
  );
}
function emit_connect(from3, to2, kind) {
  return emit2(
    "clique:connect",
    object2(
      toList([
        ["from", string3(from3)],
        ["to", string3(to2)],
        ["type", string3(kind)]
      ])
    )
  );
}
function emit_change(old_from, old_to, new_from, new_to, kind) {
  let _block;
  if (kind === "") {
    _block = "bezier";
  } else {
    _block = kind;
  }
  let new_kind = _block;
  if (old_from instanceof Some) {
    if (old_to instanceof Some) {
      if (new_from instanceof Some && new_to instanceof Some) {
        let old_from$1 = old_from[0];
        let old_to$1 = old_to[0];
        let new_from$1 = new_from[0];
        let new_to$1 = new_to[0];
        return emit_reconnect(
          [old_from$1, old_to$1],
          [new_from$1, new_to$1],
          new_kind
        );
      } else {
        let old_from$1 = old_from[0];
        let old_to$1 = old_to[0];
        return emit_disconnect(old_from$1, old_to$1);
      }
    } else if (new_from instanceof Some && new_to instanceof Some) {
      let new_from$1 = new_from[0];
      let new_to$1 = new_to[0];
      return emit_connect(new_from$1, new_to$1, new_kind);
    } else {
      return none();
    }
  } else if (new_from instanceof Some && new_to instanceof Some) {
    let new_from$1 = new_from[0];
    let new_to$1 = new_to[0];
    return emit_connect(new_from$1, new_to$1, new_kind);
  } else {
    return none();
  }
}
function init4(_) {
  let model = new Model2(new None(), new None(), "bezier");
  let effect = none();
  return [model, effect];
}
function options2() {
  return toList([
    adopt_styles(false),
    on_attribute_change(
      "from",
      (value) => {
        let $ = split2(value, ".");
        if ($ instanceof Empty) {
          return new Ok(new ParentRemovedFrom());
        } else {
          let $1 = $.tail;
          if ($1 instanceof Empty) {
            return new Ok(new ParentRemovedFrom());
          } else {
            let $2 = $1.tail;
            if ($2 instanceof Empty) {
              let node2 = $.head;
              let handle2 = $1.head;
              if (node2 !== "" && handle2 !== "") {
                return new Ok(new ParentSetFrom(value));
              } else {
                return new Ok(new ParentRemovedFrom());
              }
            } else {
              return new Ok(new ParentRemovedFrom());
            }
          }
        }
      }
    ),
    on_attribute_change(
      "to",
      (value) => {
        let $ = split2(value, ".");
        if ($ instanceof Empty) {
          return new Ok(new ParentRemovedTo());
        } else {
          let $1 = $.tail;
          if ($1 instanceof Empty) {
            return new Ok(new ParentRemovedTo());
          } else {
            let $2 = $1.tail;
            if ($2 instanceof Empty) {
              let node2 = $.head;
              let handle2 = $1.head;
              if (node2 !== "" && handle2 !== "") {
                return new Ok(new ParentSetTo(value));
              } else {
                return new Ok(new ParentRemovedTo());
              }
            } else {
              return new Ok(new ParentRemovedTo());
            }
          }
        }
      }
    ),
    on_attribute_change(
      "type",
      (value) => {
        if (value === "") {
          return new Ok(new ParentSetType("bezier"));
        } else {
          return new Ok(new ParentSetType(value));
        }
      }
    )
  ]);
}
function update3(prev, msg) {
  if (msg instanceof ParentRemovedFrom) {
    let next = new Model2(new None(), prev.to, prev.kind);
    let effect = emit_change(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else if (msg instanceof ParentRemovedTo) {
    let next = new Model2(prev.from, new None(), prev.kind);
    let effect = emit_change(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else if (msg instanceof ParentSetFrom) {
    let value = msg.value;
    let next = new Model2(new Some(value), prev.to, prev.kind);
    let effect = emit_change(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else if (msg instanceof ParentSetTo) {
    let value = msg.value;
    let next = new Model2(prev.from, new Some(value), prev.kind);
    let effect = emit_change(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  } else {
    let value = msg.value;
    let next = new Model2(prev.from, prev.to, value);
    let effect = emit_change(prev.from, prev.to, next.from, next.to, next.kind);
    return [next, effect];
  }
}
function view2(model) {
  return fragment2(
    toList([
      style2(
        toList([]),
        ":host {\n        display: contents;\n      }\n\n      slot {\n        display: inline-block;\n        position: absolute;\n        transform-origin: center;\n        will-change: transform;\n        pointer-events: auto;\n      }\n      "
      ),
      (() => {
        let $ = model.from;
        let $1 = model.to;
        if ($ instanceof Some && $1 instanceof Some) {
          let translate_x = "var(--cx)";
          let translate_y = "var(--cy)";
          let transform3 = "translate(" + translate_x + ", " + translate_y + ") translate(-50%, -50%)";
          return default_slot(
            toList([style("transform", transform3)]),
            toList([])
          );
        } else {
          return none2();
        }
      })()
    ])
  );
}
var tag2 = "clique-edge";
function register2() {
  return make_component(component(init4, update3, view2, options2()), tag2);
}

// build/dev/javascript/clique/clique/internal/dom.ffi.mjs
var is_element = (dynamic2) => dynamic2 instanceof HTMLElement;
var get_attribute = (element4, key) => {
  if (element4.hasAttribute(key)) {
    return new Ok(element4.getAttribute(key));
  } else {
    return new Error(void 0);
  }
};
var make_fallback_element = () => document.createElement("div");
var assigned_elements = (slot3) => {
  if (slot3 instanceof HTMLSlotElement) {
    return List.fromArray(Array.from(slot3.assignedElements()));
  } else {
    return new Empty();
  }
};
var add_event_listener = (shadow_root, name2, handler2) => {
  const host = shadow_root.host;
  if (host) {
    host.addEventListener(name2, handler2);
  }
};
var prevent_default2 = (event4, yes) => {
  if (yes) event4.preventDefault();
};
var stop_propagation = (event4, yes) => {
  if (yes) event4.stopPropagation();
};

// build/dev/javascript/clique/clique/internal/dom.mjs
function add_event_listener2(name2, decoder3) {
  return before_paint(
    (dispatch, shadow_root) => {
      return add_event_listener(
        shadow_root,
        name2,
        (event4) => {
          let $ = run(event4, decoder3);
          if ($ instanceof Ok) {
            let handler2 = $[0];
            let $1 = prevent_default2(event4, handler2.prevent_default);
            let $2 = stop_propagation(event4, handler2.stop_propagation);
            return dispatch(handler2.message);
          } else {
            return void 0;
          }
        }
      );
    }
  );
}
function attribute3(element4, name2) {
  return get_attribute(element4, name2);
}
function element_decoder() {
  return new_primitive_decoder(
    "HtmlElement",
    (dynamic2) => {
      let $ = is_element(dynamic2);
      if ($) {
        return new Ok(identity2(dynamic2));
      } else {
        return new Error(make_fallback_element());
      }
    }
  );
}

// build/dev/javascript/clique/clique/internal/drag.mjs
var Settled = class extends CustomType {
};
var Active = class extends CustomType {
  constructor(x, y, vx, vy) {
    super();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
};
var Inertia = class extends CustomType {
  constructor(vx, vy) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
};
function start4(x, y) {
  return new Active(x, y, 0, 0);
}
function on_animation_frame(handler2) {
  return after_paint((dispatch, _) => {
    return dispatch(handler2);
  });
}
var friction = 0.85;
function update4(state, x, y) {
  if (state instanceof Settled) {
    return [start4(x, y), 0, 0];
  } else if (state instanceof Active) {
    let dx = x - state.x;
    let dy = y - state.y;
    let vx = dx * friction;
    let vy = dy * friction;
    return [new Active(x, y, vx, vy), dx, dy];
  } else {
    return [start4(x, y), 0, 0];
  }
}
var min_velocity = 0.2;
function tick2(state, tick3) {
  if (state instanceof Settled) {
    return [state, 0, 0, none()];
  } else if (state instanceof Active) {
    return [state, 0, 0, none()];
  } else {
    let vx = state.vx;
    let vy = state.vy;
    let vx$1 = vx * friction;
    let vx_abs = absolute_value(vx$1);
    let vy$1 = vy * friction;
    let vy_abs = absolute_value(vy$1);
    let $ = vx_abs < min_velocity && vy_abs < min_velocity;
    if ($) {
      return [new Settled(), vx$1, vy$1, none()];
    } else {
      return [new Inertia(vx$1, vy$1), vx$1, vy$1, on_animation_frame(tick3)];
    }
  }
}
var threshold = 5;
function stop(state, tick3) {
  if (state instanceof Settled) {
    return [new Settled(), none()];
  } else if (state instanceof Active) {
    let vx = state.vx;
    let vy = state.vy;
    let vx_abs = absolute_value(vx);
    let vy_abs = absolute_value(vy);
    let velocity_magnitude = vx_abs + vy_abs;
    let $ = velocity_magnitude > threshold;
    if ($) {
      return [new Inertia(vx, vy), on_animation_frame(tick3)];
    } else {
      return [new Settled(), none()];
    }
  } else {
    return [new Settled(), none()];
  }
}

// build/dev/javascript/clique/clique/internal/prop.mjs
var Prop = class extends CustomType {
  constructor(value, state) {
    super();
    this.value = value;
    this.state = state;
  }
};
var Unchanged = class extends CustomType {
};
var Touched = class extends CustomType {
};
var Controlled = class extends CustomType {
};
function new$9(value) {
  return new Prop(value, new Unchanged());
}
function controlled(value) {
  return new Prop(value, new Controlled());
}
function uncontrolled(prop, value) {
  let $ = prop.state;
  if ($ instanceof Unchanged) {
    return new Prop(value, prop.state);
  } else if ($ instanceof Touched) {
    return prop;
  } else {
    return prop;
  }
}
function update5(prop, value) {
  let $ = prop.state;
  if ($ instanceof Unchanged) {
    return new Prop(value, new Touched());
  } else if ($ instanceof Touched) {
    return new Prop(value, new Touched());
  } else {
    return prop;
  }
}

// build/dev/javascript/clique/clique/node.ffi.mjs
var set_transform = (shadow_root, value) => {
  const host = shadow_root.host;
  if (host) {
    host.style.transform = value;
  }
};
var add_window_mousemove_listener = (callback, handle_mouseup) => {
  const style3 = document.createElement("style");
  style3.textContent = `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  `;
  document.head.appendChild(style3);
  let rafId = null;
  let data2 = null;
  let throttledCallback = (event4) => {
    data2 = event4;
    if (!rafId) {
      rafId = window.requestAnimationFrame(() => {
        callback(data2);
        rafId = data2 = null;
      });
    }
  };
  window.addEventListener("mousemove", throttledCallback, { passive: true });
  window.addEventListener(
    "mouseup",
    () => {
      document.head.removeChild(style3);
      rafId = data2 = null;
      window.removeEventListener("mousemove", throttledCallback);
      handle_mouseup();
    },
    { once: true }
  );
};

// build/dev/javascript/clique/clique/node.mjs
var Model3 = class extends CustomType {
  constructor(id2, position2, dragging, scale) {
    super();
    this.id = id2;
    this.position = position2;
    this.dragging = dragging;
    this.scale = scale;
  }
};
var BrowserPainted = class extends CustomType {
};
var InertiaSimulationTicked = class extends CustomType {
};
var ParentProvidedScale = class extends CustomType {
  constructor(scale) {
    super();
    this.scale = scale;
  }
};
var ParentSetId = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};
var ParentSetInitialPosition = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var ParentUpdatedPosition = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var UserDraggedNode = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var UserStartedDrag = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var UserStoppedDrag = class extends CustomType {
};
function position(x, y) {
  return property2(
    "position",
    preprocessed_array(toList([float3(x), float3(y)]))
  );
}
function nodrag() {
  return data("clique-disable", "drag");
}
function on_change(handler2) {
  return on(
    "clique:change",
    subfield(
      toList(["target", "id"]),
      string2,
      (id2) => {
        return subfield(
          toList(["detail", "dx"]),
          float2,
          (dx) => {
            return subfield(
              toList(["detail", "dy"]),
              float2,
              (dy) => {
                return success(handler2(id2, dx, dy));
              }
            );
          }
        );
      }
    )
  );
}
function emit_change2(dx, dy) {
  return guard(
    dx === 0 && dy === 0,
    none(),
    () => {
      return emit2(
        "clique:change",
        object2(toList([["dx", float3(dx)], ["dy", float3(dy)]]))
      );
    }
  );
}
function on_drag(handler2) {
  return on(
    "clique:drag",
    subfield(
      toList(["target", "id"]),
      string2,
      (id2) => {
        return subfield(
          toList(["detail", "x"]),
          float2,
          (x) => {
            return subfield(
              toList(["detail", "y"]),
              float2,
              (y) => {
                return subfield(
                  toList(["detail", "dx"]),
                  float2,
                  (dx) => {
                    return subfield(
                      toList(["detail", "dy"]),
                      float2,
                      (dy) => {
                        return success(handler2(id2, x, y, dx, dy));
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    )
  );
}
function emit_drag(x, y, dx, dy) {
  return emit2(
    "clique:drag",
    object2(
      toList([
        ["x", float3(x)],
        ["y", float3(y)],
        ["dx", float3(dx)],
        ["dy", float3(dy)]
      ])
    )
  );
}
function on_mount(handler2) {
  return on(
    "clique:mount",
    field(
      "target",
      element_decoder(),
      (target2) => {
        return subfield(
          toList(["target", "id"]),
          string2,
          (id2) => {
            return success(handler2(target2, id2));
          }
        );
      }
    )
  );
}
function emit_mount() {
  return emit2("clique:mount", null$());
}
function provide3(id2) {
  return provide(
    "clique/node",
    object2(toList([["id", string3(id2)]]))
  );
}
function on_context_change2(handler2) {
  return on_context_change(
    "clique/node",
    field(
      "id",
      string2,
      (id2) => {
        return success(handler2(id2));
      }
    )
  );
}
function options3() {
  return toList([
    adopt_styles(false),
    on_attribute_change(
      "id",
      (value) => {
        return new Ok(new ParentSetId(trim(value)));
      }
    ),
    on_attribute_change(
      "position",
      (value) => {
        let $ = (() => {
          let _pipe = split2(value, " ");
          return map(_pipe, trim);
        })();
        if ($ instanceof Empty) {
          return new Error(void 0);
        } else {
          let $1 = $.tail;
          if ($1 instanceof Empty) {
            return new Error(void 0);
          } else {
            let $2 = $1.tail;
            if ($2 instanceof Empty) {
              let x = $.head;
              let y = $1.head;
              let $3 = parse(x);
              let $4 = parse(y);
              if ($3 instanceof Ok && $4 instanceof Ok) {
                let x$1 = $3[0];
                let y$1 = $4[0];
                return new Ok(new ParentSetInitialPosition(x$1, y$1));
              } else {
                return new Error(void 0);
              }
            } else {
              return new Error(void 0);
            }
          }
        }
      }
    ),
    on_property_change(
      "position",
      field(
        0,
        float2,
        (x) => {
          return field(
            1,
            float2,
            (y) => {
              return success(new ParentUpdatedPosition(x, y));
            }
          );
        }
      )
    ),
    on_scale_change(
      (var0) => {
        return new ParentProvidedScale(var0);
      }
    )
  ]);
}
function set_transform2(position2) {
  return before_paint(
    (_, shadow_root) => {
      let transform3 = "translate(" + float_to_string(position2.value[0]) + "px, " + float_to_string(
        position2.value[1]
      ) + "px)";
      return set_transform(shadow_root, transform3);
    }
  );
}
function init5(_) {
  let model = new Model3("", new$9([0, 0]), new Settled(), 1);
  let effect = batch(
    toList([
      set_transform2(model.position),
      after_paint(
        (dispatch, _2) => {
          return dispatch(new BrowserPainted());
        }
      )
    ])
  );
  return [model, effect];
}
function add_window_mousemove_listener2() {
  return from(
    (dispatch) => {
      return add_window_mousemove_listener(
        (event4) => {
          let decoder3 = field(
            "clientX",
            float2,
            (client_x) => {
              return field(
                "clientY",
                float2,
                (client_y) => {
                  return success(
                    new UserDraggedNode(client_x, client_y)
                  );
                }
              );
            }
          );
          let $ = run(event4, decoder3);
          if ($ instanceof Ok) {
            let msg = $[0];
            return dispatch(msg);
          } else {
            return void 0;
          }
        },
        () => {
          return dispatch(new UserStoppedDrag());
        }
      );
    }
  );
}
function update6(model, msg) {
  if (msg instanceof BrowserPainted) {
    return [model, emit_mount()];
  } else if (msg instanceof InertiaSimulationTicked) {
    let $ = tick2(model.dragging, new InertiaSimulationTicked());
    let dragging;
    let vx;
    let vy;
    let inertia_effect;
    dragging = $[0];
    vx = $[1];
    vy = $[2];
    inertia_effect = $[3];
    let x = model.position.value[0] + divideFloat(vx, model.scale);
    let y = model.position.value[1] + divideFloat(vy, model.scale);
    let dx = x - model.position.value[0];
    let dy = y - model.position.value[1];
    let position$1 = update5(model.position, [x, y]);
    let model$1 = new Model3(model.id, position$1, dragging, model.scale);
    let effect = batch(
      toList([
        inertia_effect,
        emit_drag(x, y, dx, dy),
        (() => {
          let $1 = position$1.state;
          if ($1 instanceof Unchanged) {
            return emit_change2(dx, dy);
          } else if ($1 instanceof Touched) {
            return emit_change2(dx, dy);
          } else {
            return none();
          }
        })(),
        set_transform2(model$1.position)
      ])
    );
    return [model$1, effect];
  } else if (msg instanceof ParentProvidedScale) {
    let scale = msg.scale;
    let model$1 = new Model3(model.id, model.position, model.dragging, scale);
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentSetId) {
    let id2 = msg.id;
    let model$1 = new Model3(id2, model.position, model.dragging, model.scale);
    let effect = provide3(id2);
    return [model$1, effect];
  } else if (msg instanceof ParentSetInitialPosition) {
    let x = msg.x;
    let y = msg.y;
    let position$1 = uncontrolled(model.position, [x, y]);
    let dx = position$1.value[0] - model.position.value[0];
    let dy = position$1.value[1] - model.position.value[1];
    let model$1 = new Model3(model.id, position$1, model.dragging, model.scale);
    let effect = batch(
      toList([set_transform2(model$1.position), emit_change2(dx, dy)])
    );
    return [model$1, effect];
  } else if (msg instanceof ParentUpdatedPosition) {
    let x = msg.x;
    let y = msg.y;
    let position$1 = controlled([x, y]);
    let dx = position$1.value[0] - model.position.value[0];
    let dy = position$1.value[1] - model.position.value[1];
    let model$1 = new Model3(model.id, position$1, model.dragging, model.scale);
    let effect = batch(
      toList([set_transform2(model$1.position), emit_change2(dx, dy)])
    );
    return [model$1, effect];
  } else if (msg instanceof UserDraggedNode) {
    let x = msg.x;
    let y = msg.y;
    let $ = update4(model.dragging, x, y);
    let dragging;
    let dx;
    let dy;
    dragging = $[0];
    dx = $[1];
    dy = $[2];
    let dx$1 = divideFloat(dx, model.scale);
    let dy$1 = divideFloat(dy, model.scale);
    let nx = model.position.value[0] + dx$1;
    let ny = model.position.value[1] + dy$1;
    let position$1 = update5(model.position, [nx, ny]);
    let model$1 = new Model3(model.id, position$1, dragging, model.scale);
    let effect = batch(
      toList([
        emit_drag(nx, ny, dx$1, dy$1),
        (() => {
          let $1 = position$1.state;
          if ($1 instanceof Unchanged) {
            return emit_change2(dx$1, dy$1);
          } else if ($1 instanceof Touched) {
            return emit_change2(dx$1, dy$1);
          } else {
            return none();
          }
        })(),
        set_transform2(position$1)
      ])
    );
    return [model$1, effect];
  } else if (msg instanceof UserStartedDrag) {
    let x = msg.x;
    let y = msg.y;
    let dragging = start4(x, y);
    let model$1 = new Model3(model.id, model.position, dragging, model.scale);
    let effect = batch(
      toList([
        add_window_mousemove_listener2(),
        set_pseudo_state2("dragging")
      ])
    );
    return [model$1, effect];
  } else {
    let $ = stop(model.dragging, new InertiaSimulationTicked());
    let dragging;
    let inertia_effect;
    dragging = $[0];
    inertia_effect = $[1];
    let model$1 = new Model3(model.id, model.position, dragging, model.scale);
    let effect = batch(
      toList([inertia_effect, remove_pseudo_state2("dragging")])
    );
    return [model$1, effect];
  }
}
function view3(_) {
  let handle_mousedown = field(
    "target",
    element_decoder(),
    (target2) => {
      return field(
        "clientX",
        float2,
        (client_x) => {
          return field(
            "clientY",
            float2,
            (client_y) => {
              let dispatch = new UserStartedDrag(client_x, client_y);
              let success2 = success(
                handler(dispatch, false, true)
              );
              let failure2 = failure(
                handler(dispatch, false, false),
                ""
              );
              let $ = attribute3(target2, "data-clique-disable");
              if ($ instanceof Ok) {
                let $1 = $[0];
                if ($1 === "") {
                  return success2;
                } else {
                  let disable = $1;
                  let _block;
                  let _pipe = disable;
                  let _pipe$1 = split2(_pipe, " ");
                  let _pipe$2 = map(_pipe$1, trim);
                  _block = contains(_pipe$2, "drag");
                  let nodrag$1 = _block;
                  if (nodrag$1) {
                    return failure2;
                  } else {
                    return success2;
                  }
                }
              } else {
                return success2;
              }
            }
          );
        }
      );
    }
  );
  return fragment2(
    toList([
      style2(
        toList([]),
        ":host {\n        cursor: grab;\n        display: block;\n        min-width: max-content;\n        position: absolute !important;\n        top: 0 !important;\n        left: 0 !important;\n        will-change: transform;\n        backface-visibility: hidden;\n      }\n\n      :host(:state(dragging)) {\n        cursor: grabbing;\n        user-select: none;\n      }\n      "
      ),
      default_slot(
        toList([advanced("mousedown", handle_mousedown)]),
        toList([])
      )
    ])
  );
}
var tag4 = "clique-node";
function register3() {
  return make_component(component(init5, update6, view3, options3()), tag4);
}
function root4(attributes, children2) {
  return element2(tag4, attributes, children2);
}

// build/dev/javascript/clique/clique/position.mjs
var Top = class extends CustomType {
};
var TopLeft = class extends CustomType {
};
var TopRight = class extends CustomType {
};
var Right = class extends CustomType {
};
var Bottom = class extends CustomType {
};
var BottomLeft = class extends CustomType {
};
var BottomRight = class extends CustomType {
};
var Left = class extends CustomType {
};

// build/dev/javascript/clique/clique/handle.mjs
var Handle = class extends CustomType {
  constructor(node2, name2) {
    super();
    this.node = node2;
    this.name = name2;
  }
};
var Model4 = class extends CustomType {
  constructor(node2, name2, disabled, connection, tolerance) {
    super();
    this.node = node2;
    this.name = name2;
    this.disabled = disabled;
    this.connection = connection;
    this.tolerance = tolerance;
  }
};
var NodeProvidedContext = class extends CustomType {
  constructor(id2) {
    super();
    this.id = id2;
  }
};
var ParentSetDisabled = class extends CustomType {
};
var ParentSetName = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
var ParentSetTolerance = class extends CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
};
var ParentToggledDisabled = class extends CustomType {
};
var UserCompletedConnection = class extends CustomType {
};
var UserStartedConnection = class extends CustomType {
};
var ViewportProvidedConnection = class extends CustomType {
  constructor(connection) {
    super();
    this.connection = connection;
  }
};
function on_connection_start(handler2) {
  return on(
    "clique:connection-start",
    subfield(
      toList(["detail", "node"]),
      string2,
      (node2) => {
        return subfield(
          toList(["detail", "name"]),
          string2,
          (name2) => {
            return success(handler2(new Handle(node2, name2)));
          }
        );
      }
    )
  );
}
function emit_connection_start(node2, handle2) {
  return emit2(
    "clique:connection-start",
    object2(
      toList([["node", string3(node2)], ["name", string3(handle2)]])
    )
  );
}
function on_connection_complete(handler2) {
  let handle_decoder = field(
    "node",
    string2,
    (node2) => {
      return field(
        "name",
        string2,
        (name2) => {
          return success(new Handle(node2, name2));
        }
      );
    }
  );
  return on(
    "clique:connection-complete",
    subfield(
      toList(["detail", "from"]),
      handle_decoder,
      (from3) => {
        return subfield(
          toList(["detail", "to"]),
          handle_decoder,
          (to2) => {
            return success(handler2(from3, to2));
          }
        );
      }
    )
  );
}
function emit_connection_complete(from3, to2) {
  return emit2(
    "clique:connection-complete",
    object2(
      toList([
        [
          "from",
          object2(
            toList([
              ["node", string3(from3[0])],
              ["name", string3(from3[1])]
            ])
          )
        ],
        [
          "to",
          object2(
            toList([
              ["node", string3(to2[0])],
              ["name", string3(to2[1])]
            ])
          )
        ]
      ])
    )
  );
}
function init6(_) {
  let model = new Model4("", "", false, new None(), 5);
  let effect = batch(
    toList([
      add_event_listener2(
        "mousedown",
        success(
          handler(new UserStartedConnection(), false, true)
        )
      ),
      add_event_listener2(
        "mouseup",
        success(
          handler(new UserCompletedConnection(), false, false)
        )
      ),
      set_pseudo_state2("invalid")
    ])
  );
  return [model, effect];
}
function options4() {
  return toList([
    adopt_styles(false),
    on_attribute_change(
      "disabled",
      (value) => {
        let $ = trim(value);
        if ($ === "") {
          return new Ok(new ParentToggledDisabled());
        } else {
          return new Ok(new ParentSetDisabled());
        }
      }
    ),
    on_attribute_change(
      "name",
      (value) => {
        return new Ok(new ParentSetName(trim(value)));
      }
    ),
    on_attribute_change(
      "tolerance",
      (value) => {
        let $ = parse_int(value);
        if ($ instanceof Ok) {
          let v = $[0];
          if (v >= 0) {
            return new Ok(new ParentSetTolerance(v));
          } else {
            return new Ok(new ParentSetTolerance(5));
          }
        } else {
          return new Ok(new ParentSetTolerance(5));
        }
      }
    ),
    on_property_change(
      "tolerance",
      then$(
        int2,
        (v) => {
          let $ = v >= 0;
          if ($) {
            return success(new ParentSetTolerance(v));
          } else {
            return success(new ParentSetTolerance(5));
          }
        }
      )
    ),
    on_context_change2((var0) => {
      return new NodeProvidedContext(var0);
    }),
    on_connection_change(
      (var0) => {
        return new ViewportProvidedConnection(var0);
      }
    )
  ]);
}
function update7(model, msg) {
  if (msg instanceof NodeProvidedContext) {
    let id2 = msg.id;
    let model$1 = new Model4(
      id2,
      model.name,
      model.disabled,
      model.connection,
      model.tolerance
    );
    let _block;
    let $ = model$1.node;
    let $1 = model$1.name;
    if ($ === "") {
      _block = set_pseudo_state2("invalid");
    } else if ($1 === "") {
      _block = set_pseudo_state2("invalid");
    } else {
      _block = remove_pseudo_state2("invalid");
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof ParentSetDisabled) {
    let model$1 = new Model4(
      model.node,
      model.name,
      true,
      model.connection,
      model.tolerance
    );
    let effect = set_pseudo_state2("disabled");
    return [model$1, effect];
  } else if (msg instanceof ParentSetName) {
    let value = msg.value;
    let model$1 = new Model4(
      model.node,
      value,
      model.disabled,
      model.connection,
      model.tolerance
    );
    let _block;
    let $ = model$1.node;
    let $1 = model$1.name;
    if ($ === "") {
      _block = set_pseudo_state2("invalid");
    } else if ($1 === "") {
      _block = set_pseudo_state2("invalid");
    } else {
      _block = remove_pseudo_state2("invalid");
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof ParentSetTolerance) {
    let value = msg.value;
    let model$1 = new Model4(
      model.node,
      model.name,
      model.disabled,
      model.connection,
      value
    );
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof ParentToggledDisabled) {
    let model$1 = new Model4(
      model.node,
      model.name,
      !model.disabled,
      model.connection,
      model.tolerance
    );
    let _block;
    let $ = model$1.disabled;
    if ($) {
      _block = set_pseudo_state2("disabled");
    } else {
      _block = remove_pseudo_state2("disabled");
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof UserCompletedConnection) {
    let $ = model.disabled;
    let $1 = model.node;
    let $2 = model.name;
    let $3 = model.connection;
    if ($) {
      return [model, none()];
    } else if ($1 === "") {
      return [model, none()];
    } else if ($2 === "") {
      return [model, none()];
    } else if ($3 instanceof Some) {
      let node2 = $1;
      let name2 = $2;
      let from3 = $3[0];
      return [model, emit_connection_complete(from3, [node2, name2])];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof UserStartedConnection) {
    let $ = model.disabled;
    let $1 = model.node;
    let $2 = model.name;
    if ($) {
      return [model, none()];
    } else if ($1 === "") {
      return [model, none()];
    } else if ($2 === "") {
      return [model, none()];
    } else {
      let node2 = $1;
      let name2 = $2;
      return [model, emit_connection_start(node2, name2)];
    }
  } else {
    let connection = msg.connection;
    let model$1 = new Model4(
      model.node,
      model.name,
      model.disabled,
      connection,
      model.tolerance
    );
    let effect = none();
    return [model$1, effect];
  }
}
function view_tolerance_box(value) {
  let tolerance$1 = "calc(100% + " + to_string(value * 2) + "px)";
  let translate = "translate(-" + to_string(value) + "px, -" + to_string(
    value
  ) + "px)";
  return div(
    toList([
      style("width", tolerance$1),
      style("height", tolerance$1),
      style("transform", translate)
    ]),
    toList([])
  );
}
function view4(model) {
  return fragment2(
    toList([
      style2(
        toList([]),
        "\n      :host(:state(disabled)), :host(:state(invalid)) {\n        pointer-events: none;\n      }\n\n      :host(:hover) {\n        cursor: crosshair;\n      }\n\n      "
      ),
      default_slot(toList([]), toList([])),
      (() => {
        let $ = model.tolerance;
        if ($ === 0) {
          return none2();
        } else {
          return view_tolerance_box(model.tolerance);
        }
      })()
    ])
  );
}
var tag5 = "clique-handle";
function register4() {
  return make_component(component(init6, update7, view4, options4()), tag5);
}

// build/dev/javascript/clique/clique/path.ffi.mjs
var sqrt = Math.sqrt;

// build/dev/javascript/clique/clique/path.mjs
function straight(from_x, from_y, to_x, to_y) {
  let path2 = "M" + float_to_string(from_x) + "," + float_to_string(
    from_y
  ) + " L" + float_to_string(to_x) + "," + float_to_string(to_y);
  let label_x = (from_x + to_x) / 2;
  let label_y = (from_y + to_y) / 2;
  return [path2, label_x, label_y];
}
function bezier_control_point_offset(distance, curvature) {
  let $ = distance >= 0;
  if ($) {
    return 0.5 * distance;
  } else {
    return curvature * 25 * sqrt(0 - distance);
  }
}
function bezier_control_point(from_x, from_y, from_position, to_x, to_y, curvature) {
  if (from_position instanceof Top) {
    return [
      from_x,
      from_y - bezier_control_point_offset(from_y - to_y, curvature)
    ];
  } else if (from_position instanceof TopLeft) {
    return [
      from_x,
      from_y - bezier_control_point_offset(from_y - to_y, curvature)
    ];
  } else if (from_position instanceof TopRight) {
    return [
      from_x,
      from_y - bezier_control_point_offset(from_y - to_y, curvature)
    ];
  } else if (from_position instanceof Right) {
    return [
      from_x + bezier_control_point_offset(to_x - from_x, curvature),
      from_y
    ];
  } else if (from_position instanceof Bottom) {
    return [
      from_x,
      from_y + bezier_control_point_offset(to_y - from_y, curvature)
    ];
  } else if (from_position instanceof BottomLeft) {
    return [
      from_x,
      from_y + bezier_control_point_offset(to_y - from_y, curvature)
    ];
  } else if (from_position instanceof BottomRight) {
    return [
      from_x,
      from_y + bezier_control_point_offset(to_y - from_y, curvature)
    ];
  } else {
    return [
      from_x - bezier_control_point_offset(from_x - to_x, curvature),
      from_y
    ];
  }
}
function bezier(from_x, from_y, from_position, to_x, to_y, to_position) {
  let curvature = 0.25;
  let $ = bezier_control_point(
    from_x,
    from_y,
    from_position,
    to_x,
    to_y,
    curvature
  );
  let cx1;
  let cy1;
  cx1 = $[0];
  cy1 = $[1];
  let $1 = bezier_control_point(
    to_x,
    to_y,
    to_position,
    from_x,
    from_y,
    curvature
  );
  let cx2;
  let cy2;
  cx2 = $1[0];
  cy2 = $1[1];
  let path2 = "M" + float_to_string(from_x) + "," + float_to_string(
    from_y
  ) + " C" + float_to_string(cx1) + "," + float_to_string(cy1) + " " + float_to_string(
    cx2
  ) + "," + float_to_string(cy2) + " " + float_to_string(to_x) + "," + float_to_string(
    to_y
  );
  let label_x = from_x * 0.125 + cx1 * 0.375 + cx2 * 0.375 + to_x * 0.125;
  let label_y = from_y * 0.125 + cy1 * 0.375 + cy2 * 0.375 + to_y * 0.125;
  return [path2, label_x, label_y];
}
function step(from_x, from_y, to_x, to_y) {
  let mid_x = from_x + (to_x - from_x) / 2;
  let mid_y = from_y + (to_y - from_y) / 2;
  let path2 = "M" + float_to_string(from_x) + "," + float_to_string(
    from_y
  ) + "L" + float_to_string(mid_x) + "," + float_to_string(from_y) + "L" + float_to_string(
    mid_x
  ) + "," + float_to_string(to_y) + "L" + float_to_string(to_x) + "," + float_to_string(
    to_y
  );
  let label_x = mid_x;
  let label_y = mid_y;
  return [path2, label_x, label_y];
}

// build/dev/javascript/clique/clique/internal/edge_renderer.mjs
var Model5 = class extends CustomType {
  constructor(edges, handles) {
    super();
    this.edges = edges;
    this.handles = handles;
  }
};
var ParentProvidedHandles = class extends CustomType {
  constructor(handles) {
    super();
    this.handles = handles;
  }
};
var EdgeDisconnected = class extends CustomType {
  constructor(from3, to2) {
    super();
    this.from = from3;
    this.to = to2;
  }
};
var EdgeConnected = class extends CustomType {
  constructor(from3, to2, kind) {
    super();
    this.from = from3;
    this.to = to2;
    this.kind = kind;
  }
};
var EdgeReconnected = class extends CustomType {
  constructor(prev, next, kind) {
    super();
    this.prev = prev;
    this.next = next;
    this.kind = kind;
  }
};
var EdgesMounted = class extends CustomType {
  constructor(edges) {
    super();
    this.edges = edges;
  }
};
function to_default_path(kind, from3, to2) {
  if (kind === "bezier") {
    return bezier(
      from3[0],
      from3[1],
      new Right(),
      to2[0],
      to2[1],
      new Left()
    );
  } else if (kind === "step") {
    return step(from3[0], from3[1], to2[0], to2[1]);
  } else if (kind === "linear") {
    return straight(from3[0], from3[1], to2[0], to2[1]);
  } else {
    return straight(from3[0], from3[1], to2[0], to2[1]);
  }
}
function init7(_) {
  let model = new Model5(new_map(), new_map());
  let effect = none();
  return [model, effect];
}
function options5() {
  return toList([
    adopt_styles(false),
    on_handles_change(
      (var0) => {
        return new ParentProvidedHandles(var0);
      }
    )
  ]);
}
function update8(model, msg) {
  if (msg instanceof ParentProvidedHandles) {
    let handles = msg.handles;
    let model$1 = new Model5(model.edges, handles);
    return [model$1, none()];
  } else if (msg instanceof EdgeDisconnected) {
    let from3 = msg.from;
    let to2 = msg.to;
    let edges = delete$(model.edges, [from3, to2]);
    let model$1 = new Model5(edges, model.handles);
    return [model$1, none()];
  } else if (msg instanceof EdgeConnected) {
    let from3 = msg.from;
    let to2 = msg.to;
    let kind = msg.kind;
    let edges = insert(model.edges, [from3, to2], kind);
    let model$1 = new Model5(edges, model.handles);
    return [model$1, none()];
  } else if (msg instanceof EdgeReconnected) {
    let prev = msg.prev;
    let next = msg.next;
    let kind = msg.kind;
    let edges = delete$(model.edges, prev);
    let edges$1 = insert(edges, next, kind);
    let model$1 = new Model5(edges$1, model.handles);
    return [model$1, none()];
  } else {
    let edges = msg.edges;
    let edges$1 = fold2(
      edges,
      model.edges,
      (acc, edge) => {
        return insert(acc, [edge[0], edge[1]], edge[2]);
      }
    );
    let model$1 = new Model5(edges$1, model.handles);
    return [model$1, none()];
  }
}
function view5(model, to_path) {
  let $ = fold(
    model.edges,
    [toList([]), toList([])],
    (acc, edge, kind) => {
      let key = edge[0] + "-" + edge[1];
      let $1 = map_get(model.handles, edge[0]);
      let $2 = map_get(model.handles, edge[1]);
      if ($1 instanceof Ok && $2 instanceof Ok) {
        let from3 = $1[0];
        let to2 = $2[0];
        let $3 = to_path(kind, from3, to2);
        let path2;
        let cx;
        let cy;
        path2 = $3[0];
        cx = $3[1];
        cy = $3[2];
        let path$1 = path(
          toList([
            attribute2("d", path2),
            attribute2("fill", "none"),
            attribute2("stroke", "black"),
            attribute2("stroke-width", "2"),
            attribute2("shape-rendering", "geometricPrecision"),
            attribute2("stroke-linecap", "round"),
            attribute2("stroke-linejoin", "round"),
            attribute2("vector-effect", "non-scaling-stroke")
          ])
        );
        let edges2 = prepend([key, path$1], acc[1]);
        let positions2 = prepend(
          [
            key,
            style2(
              toList([]),
              '::slotted(clique-edge[from="' + edge[0] + '"][to="' + edge[1] + '"]) { --cx: ' + float_to_string(
                cx
              ) + "px; --cy: " + float_to_string(cy) + "px; }"
            )
          ],
          acc[0]
        );
        return [positions2, edges2];
      } else {
        let positions2 = prepend(
          [
            key,
            style2(
              toList([]),
              '::slotted(clique-edge[from="' + edge[0] + '"][to="' + edge[1] + '"]) { display: none; }'
            )
          ],
          acc[0]
        );
        return [positions2, acc[1]];
      }
    }
  );
  let positions;
  let edges;
  positions = $[0];
  edges = $[1];
  echo(
    [positions, edges],
    void 0,
    "src/clique/internal/edge_renderer.gleam",
    227
  );
  let handle_slotchange = field(
    "target",
    element_decoder(),
    (target2) => {
      let assigned_elements2 = assigned_elements(target2);
      let edges$1 = filter_map(
        assigned_elements2,
        (element4) => {
          return try$(
            attribute3(element4, "from"),
            (from3) => {
              return try$(
                attribute3(element4, "to"),
                (to2) => {
                  let _block;
                  let _pipe = attribute3(element4, "type");
                  _block = unwrap(_pipe, "bezier");
                  let kind = _block;
                  let $1 = split2(from3, ".");
                  let $2 = split2(to2, ".");
                  if ($1 instanceof Empty) {
                    return new Error(void 0);
                  } else if ($2 instanceof Empty) {
                    return new Error(void 0);
                  } else {
                    let $3 = $1.tail;
                    if ($3 instanceof Empty) {
                      return new Error(void 0);
                    } else {
                      let $4 = $2.tail;
                      if ($4 instanceof Empty) {
                        return new Error(void 0);
                      } else {
                        let $5 = $3.tail;
                        if ($5 instanceof Empty) {
                          let $6 = $4.tail;
                          if ($6 instanceof Empty) {
                            let from_node2 = $1.head;
                            let to_node = $2.head;
                            let from_handle = $3.head;
                            let to_handle = $4.head;
                            if (from_node2 !== "" && from_handle !== "" && to_node !== "" && to_handle !== "") {
                              return new Ok([from3, to2, kind]);
                            } else {
                              return new Error(void 0);
                            }
                          } else {
                            return new Error(void 0);
                          }
                        } else {
                          return new Error(void 0);
                        }
                      }
                    }
                  }
                }
              );
            }
          );
        }
      );
      return success(new EdgesMounted(edges$1));
    }
  );
  return fragment2(
    toList([
      style2(toList([]), ":host {\n        display: contents;\n      }"),
      fragment3(positions),
      namespaced2(
        namespace,
        "svg",
        toList([
          attribute2("width", "100%"),
          attribute2("height", "100%"),
          attribute2("shape-rendering", "geometricPrecision"),
          styles(
            toList([
              ["overflow", "visible"],
              ["position", "absolute"],
              ["top", "0"],
              ["left", "0"],
              ["will-change", "transform"],
              ["pointer-events", "none"]
            ])
          )
        ]),
        edges
      ),
      default_slot(
        toList([
          on_connect(
            (var0, var1, var2) => {
              return new EdgeConnected(var0, var1, var2);
            }
          ),
          on_disconnect(
            (var0, var1) => {
              return new EdgeDisconnected(var0, var1);
            }
          ),
          on_reconnect(
            (var0, var1, var2) => {
              return new EdgeReconnected(var0, var1, var2);
            }
          ),
          on("slotchange", handle_slotchange)
        ]),
        toList([])
      )
    ])
  );
}
var tag6 = "clique-edge-renderer";
function register5() {
  return make_component(
    component(
      init7,
      update8,
      (_capture) => {
        return view5(_capture, to_default_path);
      },
      options5()
    ),
    tag6
  );
}
function echo(value, message, file, line) {
  const grey = "\x1B[90m";
  const reset_color = "\x1B[39m";
  const file_line = `${file}:${line}`;
  const inspector = new Echo$Inspector();
  const string_value = inspector.inspect(value);
  const string_message = message === void 0 ? "" : " " + message;
  if (globalThis.process?.stderr?.write) {
    const string5 = `${grey}${file_line}${reset_color}${string_message}
${string_value}
`;
    globalThis.process.stderr.write(string5);
  } else if (globalThis.Deno) {
    const string5 = `${grey}${file_line}${reset_color}${string_message}
${string_value}
`;
    globalThis.Deno.stderr.writeSync(new TextEncoder().encode(string5));
  } else {
    const string5 = `${file_line}${string_message}
${string_value}`;
    globalThis.console.log(string5);
  }
  return value;
}
var Echo$Inspector = class {
  #references = new globalThis.Set();
  #isDict(value) {
    try {
      return value instanceof Dict;
    } catch {
      return false;
    }
  }
  #float(float4) {
    const string5 = float4.toString().replace("+", "");
    if (string5.indexOf(".") >= 0) {
      return string5;
    } else {
      const index4 = string5.indexOf("e");
      if (index4 >= 0) {
        return string5.slice(0, index4) + ".0" + string5.slice(index4);
      } else {
        return string5 + ".0";
      }
    }
  }
  inspect(v) {
    const t = typeof v;
    if (v === true) return "True";
    if (v === false) return "False";
    if (v === null) return "//js(null)";
    if (v === void 0) return "Nil";
    if (t === "string") return this.#string(v);
    if (t === "bigint" || globalThis.Number.isInteger(v)) return v.toString();
    if (t === "number") return this.#float(v);
    if (v instanceof UtfCodepoint) return this.#utfCodepoint(v);
    if (v instanceof BitArray) return this.#bit_array(v);
    if (v instanceof globalThis.RegExp) return `//js(${v})`;
    if (v instanceof globalThis.Date) return `//js(Date("${v.toISOString()}"))`;
    if (v instanceof globalThis.Error) return `//js(${v.toString()})`;
    if (v instanceof globalThis.Function) {
      const args = [];
      for (const i of globalThis.Array(v.length).keys())
        args.push(globalThis.String.fromCharCode(i + 97));
      return `//fn(${args.join(", ")}) { ... }`;
    }
    if (this.#references.size === this.#references.add(v).size) {
      return "//js(circular reference)";
    }
    let printed;
    if (globalThis.Array.isArray(v)) {
      printed = `#(${v.map((v2) => this.inspect(v2)).join(", ")})`;
    } else if (v instanceof List) {
      printed = this.#list(v);
    } else if (v instanceof CustomType) {
      printed = this.#customType(v);
    } else if (this.#isDict(v)) {
      printed = this.#dict(v);
    } else if (v instanceof Set) {
      return `//js(Set(${[...v].map((v2) => this.inspect(v2)).join(", ")}))`;
    } else {
      printed = this.#object(v);
    }
    this.#references.delete(v);
    return printed;
  }
  #object(v) {
    const name2 = globalThis.Object.getPrototypeOf(v)?.constructor?.name || "Object";
    const props = [];
    for (const k of globalThis.Object.keys(v)) {
      props.push(`${this.inspect(k)}: ${this.inspect(v[k])}`);
    }
    const body2 = props.length ? " " + props.join(", ") + " " : "";
    const head2 = name2 === "Object" ? "" : name2 + " ";
    return `//js(${head2}{${body2}})`;
  }
  #dict(map4) {
    let body2 = "dict.from_list([";
    let first = true;
    let key_value_pairs = [];
    map4.forEach((value, key) => {
      key_value_pairs.push([key, value]);
    });
    key_value_pairs.sort();
    key_value_pairs.forEach(([key, value]) => {
      if (!first) body2 = body2 + ", ";
      body2 = body2 + "#(" + this.inspect(key) + ", " + this.inspect(value) + ")";
      first = false;
    });
    return body2 + "])";
  }
  #customType(record) {
    const props = globalThis.Object.keys(record).map((label) => {
      const value = this.inspect(record[label]);
      return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
    }).join(", ");
    return props ? `${record.constructor.name}(${props})` : record.constructor.name;
  }
  #list(list4) {
    if (list4 instanceof Empty) {
      return "[]";
    }
    let char_out = 'charlist.from_string("';
    let list_out = "[";
    let current = list4;
    while (current instanceof NonEmpty) {
      let element4 = current.head;
      current = current.tail;
      if (list_out !== "[") {
        list_out += ", ";
      }
      list_out += this.inspect(element4);
      if (char_out) {
        if (globalThis.Number.isInteger(element4) && element4 >= 32 && element4 <= 126) {
          char_out += globalThis.String.fromCharCode(element4);
        } else {
          char_out = null;
        }
      }
    }
    if (char_out) {
      return char_out + '")';
    } else {
      return list_out + "]";
    }
  }
  #string(str) {
    let new_str = '"';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      switch (char) {
        case "\n":
          new_str += "\\n";
          break;
        case "\r":
          new_str += "\\r";
          break;
        case "	":
          new_str += "\\t";
          break;
        case "\f":
          new_str += "\\f";
          break;
        case "\\":
          new_str += "\\\\";
          break;
        case '"':
          new_str += '\\"';
          break;
        default:
          if (char < " " || char > "~" && char < "\xA0") {
            new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
          } else {
            new_str += char;
          }
      }
    }
    new_str += '"';
    return new_str;
  }
  #utfCodepoint(codepoint2) {
    return `//utfcodepoint(${globalThis.String.fromCodePoint(codepoint2.value)})`;
  }
  #bit_array(bits) {
    if (bits.bitSize === 0) {
      return "<<>>";
    }
    let acc = "<<";
    for (let i = 0; i < bits.byteSize - 1; i++) {
      acc += bits.byteAt(i).toString();
      acc += ", ";
    }
    if (bits.byteSize * 8 === bits.bitSize) {
      acc += bits.byteAt(bits.byteSize - 1).toString();
    } else {
      const trailingBitsCount = bits.bitSize % 8;
      acc += bits.byteAt(bits.byteSize - 1) >> 8 - trailingBitsCount;
      acc += `:size(${trailingBitsCount})`;
    }
    acc += ">>";
    return acc;
  }
};

// build/dev/javascript/clique/clique/internal/viewport.ffi.mjs
var set_transform3 = (shadow_root, value) => {
  const viewport = shadow_root.querySelector("#viewport");
  if (viewport) {
    viewport.style.transform = value;
  }
};
var add_resize_observer = (shadow_root, on_viewport_resize, callback) => {
  const containerRef = new WeakRef(shadow_root.querySelector("#container"));
  let rafId = null;
  let pendingUpdates = /* @__PURE__ */ new Map();
  let viewportRect;
  const viewportObserver = new ResizeObserver(([entry]) => {
    viewportRect = entry.target.getBoundingClientRect();
    on_viewport_resize([
      viewportRect.x,
      viewportRect.y,
      viewportRect.width,
      viewportRect.height
    ]);
  });
  viewportObserver.observe(containerRef.deref());
  const processUpdates = () => {
    const container = containerRef.deref();
    if (!container || pendingUpdates.size === 0) return;
    const scaleX = viewportRect.width / (container.clientWidth || 1);
    const scaleY = viewportRect.height / (container.clientHeight || 1);
    const updates = [];
    for (const [node2, handles] of pendingUpdates) {
      for (const handle2 of handles) {
        const name2 = handle2.getAttribute("name");
        if (!name2) continue;
        const bounds = handle2.getBoundingClientRect();
        const cx = bounds.left + bounds.width / 2;
        const cy = bounds.top + bounds.height / 2;
        const x = (cx - viewportRect.left) / scaleX;
        const y = (cy - viewportRect.top) / scaleY;
        updates.push([node2, name2, x, y]);
      }
    }
    pendingUpdates.clear();
    if (updates.length > 0) {
      callback(List.fromArray(updates));
    }
    rafId = null;
  };
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const node2 = entry.target.getAttribute("id");
      if (!node2) continue;
      const handles = entry.target.querySelectorAll("clique-handle");
      if (handles.length === 0) continue;
      pendingUpdates.set(node2, Array.from(handles));
    }
    if (!rafId) {
      rafId = requestAnimationFrame(processUpdates);
    }
  });
  return observer;
};
var observe_node = (resize_observer, node2) => {
  resize_observer.observe(node2);
};
var add_window_mousemove_listener3 = (handle_mouseup, callback) => {
  const style3 = document.createElement("style");
  style3.textContent = `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  `;
  document.head.appendChild(style3);
  let rafId = null;
  let data2 = null;
  let throttledCallback = (event4) => {
    data2 = event4;
    if (!rafId) {
      rafId = window.requestAnimationFrame(() => {
        callback(data2);
        rafId = data2 = null;
      });
    }
  };
  window.addEventListener("mousemove", throttledCallback, { passive: true });
  window.addEventListener(
    "mouseup",
    (event4) => {
      document.head.removeChild(style3);
      rafId = data2 = null;
      window.removeEventListener("mousemove", throttledCallback);
      handle_mouseup(event4);
    },
    { once: true }
  );
};

// build/dev/javascript/clique/clique/internal/viewport.mjs
var Model6 = class extends CustomType {
  constructor(transform3, observer, handles, panning, connection, bounds) {
    super();
    this.transform = transform3;
    this.observer = observer;
    this.handles = handles;
    this.panning = panning;
    this.connection = connection;
    this.bounds = bounds;
  }
};
var InertiaSimulationTicked2 = class extends CustomType {
};
var NodeMounted = class extends CustomType {
  constructor(element4, id2) {
    super();
    this.element = element4;
    this.id = id2;
  }
};
var NodeMoved = class extends CustomType {
  constructor(id2, dx, dy) {
    super();
    this.id = id2;
    this.dx = dx;
    this.dy = dy;
  }
};
var NodeResizeObserverStarted = class extends CustomType {
  constructor(observer) {
    super();
    this.observer = observer;
  }
};
var NodesResized = class extends CustomType {
  constructor(changes) {
    super();
    this.changes = changes;
  }
};
var ParentSetInitialTransform = class extends CustomType {
  constructor(transform3) {
    super();
    this.transform = transform3;
  }
};
var ParentUpdatedTransform = class extends CustomType {
  constructor(transform3) {
    super();
    this.transform = transform3;
  }
};
var UserCompletedConnection2 = class extends CustomType {
};
var UserPannedViewport = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var UserStartedConnection2 = class extends CustomType {
  constructor(source) {
    super();
    this.source = source;
  }
};
var UserStartedPanning = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var UserStoppedPanning = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
var UserZoomedViewport = class extends CustomType {
  constructor(client_x, client_y, delta) {
    super();
    this.client_x = client_x;
    this.client_y = client_y;
    this.delta = delta;
  }
};
var ViewportReszied = class extends CustomType {
  constructor(bounds) {
    super();
    this.bounds = bounds;
  }
};
function initial_transform(transform3) {
  return attribute2("transform", to_string4(transform3));
}
function transform(transform3) {
  let $ = is_browser();
  if ($) {
    return property2("transform", to_json5(transform3));
  } else {
    return initial_transform(transform3);
  }
}
function emit_resize(bounds) {
  return emit2("clique:resize", to_json4(bounds));
}
function emit_connection_cancel(from3, x, y) {
  return emit2(
    "clique:connection-cancel",
    object2(
      toList([
        [
          "from",
          object2(
            toList([
              ["node", string3(from3[0])],
              ["name", string3(from3[1])]
            ])
          )
        ],
        ["x", float3(x)],
        ["y", float3(y)]
      ])
    )
  );
}
function on_pan(handler2) {
  return on(
    "clique:pan",
    field(
      "detail",
      decoder(),
      (transform3) => {
        return success(handler2(transform3));
      }
    )
  );
}
function emit_pan(transform3) {
  return emit2("clique:pan", to_json5(transform3));
}
function on_zoom(handler2) {
  return on(
    "clique:zoom",
    field(
      "detail",
      decoder(),
      (transform3) => {
        return success(handler2(transform3));
      }
    )
  );
}
function emit_zoom(transform3) {
  return emit2("clique:zoom", to_json5(transform3));
}
function add_resize_observer2() {
  return before_paint(
    (dispatch, shadow_root) => {
      let observer = add_resize_observer(
        shadow_root,
        (bounds) => {
          return dispatch(new ViewportReszied(bounds));
        },
        (changes) => {
          return dispatch(new NodesResized(changes));
        }
      );
      return dispatch(new NodeResizeObserverStarted(observer));
    }
  );
}
function options6() {
  return toList([
    adopt_styles(false),
    on_attribute_change(
      "transform",
      (value) => {
        let $ = (() => {
          let _pipe = split2(value, " ");
          return map(_pipe, trim);
        })();
        if ($ instanceof Empty) {
          return new Error(void 0);
        } else {
          let $1 = $.tail;
          if ($1 instanceof Empty) {
            return new Error(void 0);
          } else {
            let $2 = $1.tail;
            if ($2 instanceof Empty) {
              return new Error(void 0);
            } else {
              let $3 = $2.tail;
              if ($3 instanceof Empty) {
                let x = $.head;
                let y = $1.head;
                let zoom = $2.head;
                let $4 = parse(x);
                let $5 = parse(y);
                let $6 = parse(zoom);
                if ($4 instanceof Ok && $5 instanceof Ok && $6 instanceof Ok) {
                  let x$1 = $4[0];
                  let y$1 = $5[0];
                  let zoom$1 = $6[0];
                  return new Ok(
                    new ParentSetInitialTransform(
                      new$7(x$1, y$1, zoom$1)
                    )
                  );
                } else {
                  return new Error(void 0);
                }
              } else {
                return new Error(void 0);
              }
            }
          }
        }
      }
    ),
    on_property_change(
      "transform",
      (() => {
        let _pipe = decoder();
        return map2(
          _pipe,
          (var0) => {
            return new ParentUpdatedTransform(var0);
          }
        );
      })()
    )
  ]);
}
function set_transform4(transform3) {
  return before_paint(
    (_, shadow_root) => {
      let matrix = to_css_matrix(transform3.value);
      return set_transform3(shadow_root, matrix);
    }
  );
}
function init8(_) {
  let model = new Model6(
    new$9(init2()),
    new None(),
    new_map(),
    new Settled(),
    new None(),
    init()
  );
  let effect = batch(
    toList([
      provide_transform(model.transform.value),
      provide_scale(model.transform.value[2]),
      provide_connection(new None()),
      set_transform4(model.transform),
      provide_handles(model.handles),
      add_resize_observer2()
    ])
  );
  return [model, effect];
}
function add_window_mousemove_listener4() {
  return from(
    (dispatch) => {
      let decoder3 = (msg) => {
        return field(
          "clientX",
          float2,
          (client_x) => {
            return field(
              "clientY",
              float2,
              (client_y) => {
                return success(msg(client_x, client_y));
              }
            );
          }
        );
      };
      return add_window_mousemove_listener3(
        (event4) => {
          let $ = run(
            event4,
            decoder3(
              (var0, var1) => {
                return new UserStoppedPanning(var0, var1);
              }
            )
          );
          if ($ instanceof Ok) {
            let msg = $[0];
            return dispatch(msg);
          } else {
            return void 0;
          }
        },
        (event4) => {
          let $ = run(
            event4,
            decoder3(
              (var0, var1) => {
                return new UserPannedViewport(var0, var1);
              }
            )
          );
          if ($ instanceof Ok) {
            let msg = $[0];
            return dispatch(msg);
          } else {
            return void 0;
          }
        }
      );
    }
  );
}
function observe_node2(observer, element4) {
  return from((_) => {
    return observe_node(observer, element4);
  });
}
function update9(model, msg) {
  if (msg instanceof InertiaSimulationTicked2) {
    let $ = tick2(model.panning, new InertiaSimulationTicked2());
    let panning;
    let vx;
    let vy;
    let inertia_effect;
    panning = $[0];
    vx = $[1];
    vy = $[2];
    inertia_effect = $[3];
    let nx = model.transform.value[0] + vx;
    let ny = model.transform.value[1] + vy;
    let new_transform = new$7(nx, ny, model.transform.value[2]);
    let model$1 = new Model6(
      update5(model.transform, new_transform),
      model.observer,
      model.handles,
      panning,
      model.connection,
      model.bounds
    );
    let _block;
    let $1 = model$1.transform.state;
    if ($1 instanceof Unchanged) {
      _block = batch(
        toList([
          inertia_effect,
          set_transform4(model$1.transform),
          provide_transform(model$1.transform.value),
          emit_pan(new_transform)
        ])
      );
    } else if ($1 instanceof Touched) {
      _block = batch(
        toList([
          inertia_effect,
          set_transform4(model$1.transform),
          provide_transform(model$1.transform.value),
          emit_pan(new_transform)
        ])
      );
    } else {
      _block = batch(toList([inertia_effect, emit_pan(new_transform)]));
    }
    let effect = _block;
    return [model$1, effect];
  } else if (msg instanceof NodeMounted) {
    let element$1 = msg.element;
    let $ = model.observer;
    if ($ instanceof Some) {
      let observer = $[0];
      return [model, observe_node2(observer, element$1)];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof NodeMoved) {
    let node2 = msg.id;
    let dx = msg.dx;
    let dy = msg.dy;
    let $ = map_get(model.handles, node2);
    if ($ instanceof Ok) {
      let node_handles = $[0];
      let _block;
      let _pipe = node_handles;
      let _pipe$1 = map_values(
        _pipe,
        (_, position2) => {
          return [position2[0] + dx, position2[1] + dy];
        }
      );
      _block = ((_capture) => {
        return insert(model.handles, node2, _capture);
      })(_pipe$1);
      let handles = _block;
      let model$1 = new Model6(
        model.transform,
        model.observer,
        handles,
        model.panning,
        model.connection,
        model.bounds
      );
      let effect = provide_handles(handles);
      return [model$1, effect];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof NodeResizeObserverStarted) {
    let observer = msg.observer;
    let model$1 = new Model6(
      model.transform,
      new Some(observer),
      model.handles,
      model.panning,
      model.connection,
      model.bounds
    );
    let effect = none();
    return [model$1, effect];
  } else if (msg instanceof NodesResized) {
    let changes = msg.changes;
    let handles = fold2(
      changes,
      model.handles,
      (all, _use1) => {
        let node2;
        let handle2;
        let x;
        let y;
        node2 = _use1[0];
        handle2 = _use1[1];
        x = _use1[2];
        y = _use1[3];
        let x$1 = divideFloat(
          x - model.transform.value[0],
          model.transform.value[2]
        );
        let y$1 = divideFloat(
          y - model.transform.value[1],
          model.transform.value[2]
        );
        let position2 = [x$1, y$1];
        let $ = map_get(all, node2);
        if ($ instanceof Ok) {
          let for_node = $[0];
          return insert(
            all,
            node2,
            insert(for_node, handle2, position2)
          );
        } else {
          return insert(
            all,
            node2,
            from_list(toList([[handle2, position2]]))
          );
        }
      }
    );
    let model$1 = new Model6(
      model.transform,
      model.observer,
      handles,
      model.panning,
      model.connection,
      model.bounds
    );
    let effect = provide_handles(handles);
    return [model$1, effect];
  } else if (msg instanceof ParentSetInitialTransform) {
    let new_transform = msg.transform;
    let transform$1 = uncontrolled(model.transform, new_transform);
    let model$1 = new Model6(
      transform$1,
      model.observer,
      model.handles,
      model.panning,
      model.connection,
      model.bounds
    );
    let effect = batch(
      toList([
        set_transform4(model$1.transform),
        provide_transform(model$1.transform.value),
        provide_scale(model$1.transform.value[2])
      ])
    );
    return [model$1, effect];
  } else if (msg instanceof ParentUpdatedTransform) {
    let new_transform = msg.transform;
    let transform$1 = controlled(new_transform);
    let model$1 = new Model6(
      transform$1,
      model.observer,
      model.handles,
      model.panning,
      model.connection,
      model.bounds
    );
    let effect = batch(
      toList([
        set_transform4(model$1.transform),
        provide_transform(model$1.transform.value),
        provide_scale(model$1.transform.value[2])
      ])
    );
    return [model$1, effect];
  } else if (msg instanceof UserCompletedConnection2) {
    let $ = model.connection;
    if ($ instanceof Some) {
      return [
        new Model6(
          model.transform,
          model.observer,
          model.handles,
          model.panning,
          new None(),
          model.bounds
        ),
        batch(
          toList([
            provide_connection(new None()),
            remove_pseudo_state2("connecting")
          ])
        )
      ];
    } else {
      return [model, none()];
    }
  } else if (msg instanceof UserPannedViewport) {
    let x = msg.x;
    let y = msg.y;
    let $ = model.connection;
    if ($ instanceof Some) {
      let connection = $[0][0];
      let world_x = divideFloat(
        x - model.bounds[0] - model.transform.value[0],
        model.transform.value[2]
      );
      let world_y = divideFloat(
        y - model.bounds[1] - model.transform.value[1],
        model.transform.value[2]
      );
      let position2 = [world_x, world_y];
      let model$1 = new Model6(
        model.transform,
        model.observer,
        model.handles,
        model.panning,
        new Some([connection, position2]),
        model.bounds
      );
      let effect = none();
      return [model$1, effect];
    } else {
      let $1 = update4(model.panning, x, y);
      let panning;
      let dx;
      let dy;
      panning = $1[0];
      dx = $1[1];
      dy = $1[2];
      return guard(
        dx === 0 && dy === 0,
        [
          new Model6(
            model.transform,
            model.observer,
            model.handles,
            panning,
            model.connection,
            model.bounds
          ),
          none()
        ],
        () => {
          let nx = model.transform.value[0] + dx;
          let ny = model.transform.value[1] + dy;
          let new_transform = [nx, ny, model.transform.value[2]];
          let model$1 = new Model6(
            update5(model.transform, new_transform),
            model.observer,
            model.handles,
            panning,
            model.connection,
            model.bounds
          );
          let _block;
          let $2 = model$1.transform.state;
          if ($2 instanceof Unchanged) {
            _block = batch(
              toList([
                set_transform4(model$1.transform),
                provide_transform(model$1.transform.value),
                emit_pan(new_transform)
              ])
            );
          } else if ($2 instanceof Touched) {
            _block = batch(
              toList([
                set_transform4(model$1.transform),
                provide_transform(model$1.transform.value),
                emit_pan(new_transform)
              ])
            );
          } else {
            _block = emit_pan(new_transform);
          }
          let effect = _block;
          return [model$1, effect];
        }
      );
    }
  } else if (msg instanceof UserStartedConnection2) {
    let source = msg.source;
    let result = try$(
      map_get(model.handles, source.node),
      (handles) => {
        return try$(
          map_get(handles, source.name),
          (start5) => {
            let connection = [source.node, source.name];
            let model$1 = new Model6(
              model.transform,
              model.observer,
              model.handles,
              model.panning,
              new Some([connection, start5]),
              model.bounds
            );
            let effect = batch(
              toList([
                provide_connection(new Some(connection)),
                set_pseudo_state2("connecting"),
                add_window_mousemove_listener4()
              ])
            );
            return new Ok([model$1, effect]);
          }
        );
      }
    );
    if (result instanceof Ok) {
      let update$1 = result[0];
      return update$1;
    } else {
      return [model, none()];
    }
  } else if (msg instanceof UserStartedPanning) {
    let x = msg.x;
    let y = msg.y;
    let model$1 = new Model6(
      model.transform,
      model.observer,
      model.handles,
      start4(x, y),
      model.connection,
      model.bounds
    );
    let effect = batch(
      toList([
        add_window_mousemove_listener4(),
        set_pseudo_state2("dragging")
      ])
    );
    return [model$1, effect];
  } else if (msg instanceof UserStoppedPanning) {
    let x = msg.x;
    let y = msg.y;
    let $ = stop(model.panning, new InertiaSimulationTicked2());
    let panning;
    let effect;
    panning = $[0];
    effect = $[1];
    let world_x = divideFloat(
      x - model.bounds[0] - model.transform.value[0],
      model.transform.value[2]
    );
    let world_y = divideFloat(
      y - model.bounds[1] - model.transform.value[1],
      model.transform.value[2]
    );
    let _block;
    let $1 = model.connection;
    if ($1 instanceof Some) {
      let from3 = $1[0];
      _block = batch(
        toList([
          emit_connection_cancel(from3[0], world_x, world_y),
          remove_pseudo_state2("connecting"),
          provide_connection(new None())
        ])
      );
    } else {
      _block = batch(
        toList([effect, remove_pseudo_state2("dragging")])
      );
    }
    let effect$1 = _block;
    let model$1 = new Model6(
      model.transform,
      model.observer,
      model.handles,
      panning,
      new None(),
      model.bounds
    );
    return [model$1, effect$1];
  } else if (msg instanceof UserZoomedViewport) {
    let client_x = msg.client_x;
    let client_y = msg.client_y;
    let delta = msg.delta;
    let x = client_x - model.bounds[0];
    let y = client_y - model.bounds[1];
    let _block;
    let $ = delta > 0;
    if ($) {
      _block = 1 + delta * 0.01;
    } else {
      _block = divideFloat(1, 1 + absolute_value(delta) * 0.01);
    }
    let zoom_factor = _block;
    let min_scale = 0.5;
    let max_scale = 2;
    let new_scale = model.transform.value[2] * zoom_factor;
    let _block$1;
    let s = new_scale;
    if (s < min_scale) {
      _block$1 = min_scale;
    } else {
      let s$1 = new_scale;
      if (s$1 > max_scale) {
        _block$1 = max_scale;
      } else {
        _block$1 = new_scale;
      }
    }
    let clamped_scale = _block$1;
    return guard(
      clamped_scale === model.transform.value[2],
      [model, none()],
      () => {
        let world_x = divideFloat(
          x - model.transform.value[0],
          model.transform.value[2]
        );
        let world_y = divideFloat(
          y - model.transform.value[1],
          model.transform.value[2]
        );
        let nx = x - world_x * clamped_scale;
        let ny = y - world_y * clamped_scale;
        let new_transform = new$7(nx, ny, clamped_scale);
        let model$1 = new Model6(
          update5(model.transform, new_transform),
          model.observer,
          model.handles,
          model.panning,
          model.connection,
          model.bounds
        );
        let _block$2;
        let $1 = model$1.transform.state;
        if ($1 instanceof Unchanged) {
          _block$2 = batch(
            toList([
              provide_scale(model$1.transform.value[2]),
              set_transform4(model$1.transform),
              provide_transform(model$1.transform.value),
              emit_zoom(new_transform)
            ])
          );
        } else if ($1 instanceof Touched) {
          _block$2 = batch(
            toList([
              provide_scale(model$1.transform.value[2]),
              set_transform4(model$1.transform),
              provide_transform(model$1.transform.value),
              emit_zoom(new_transform)
            ])
          );
        } else {
          _block$2 = emit_zoom(new_transform);
        }
        let effect = _block$2;
        return [model$1, effect];
      }
    );
  } else {
    let bounds = msg.bounds;
    let model$1 = new Model6(
      model.transform,
      model.observer,
      model.handles,
      model.panning,
      model.connection,
      bounds
    );
    let effect = emit_resize(bounds);
    return [model$1, effect];
  }
}
function view_container(children2) {
  let handle_mousedown = field(
    "target",
    element_decoder(),
    (target2) => {
      return field(
        "clientX",
        float2,
        (client_x) => {
          return field(
            "clientY",
            float2,
            (client_y) => {
              let dispatch = new UserStartedPanning(client_x, client_y);
              let success2 = success(
                handler(dispatch, false, true)
              );
              let failure2 = failure(
                handler(dispatch, false, false),
                ""
              );
              let $ = attribute3(target2, "data-clique-disable");
              if ($ instanceof Ok) {
                let $1 = $[0];
                if ($1 === "") {
                  return success2;
                } else {
                  let disable = $1;
                  let _block;
                  let _pipe = disable;
                  let _pipe$1 = split2(_pipe, " ");
                  let _pipe$2 = map(_pipe$1, trim);
                  _block = contains(_pipe$2, "drag");
                  let nodrag2 = _block;
                  if (nodrag2) {
                    return failure2;
                  } else {
                    return success2;
                  }
                }
              } else {
                return success2;
              }
            }
          );
        }
      );
    }
  );
  let handle_wheel = field(
    "clientX",
    float2,
    (client_x) => {
      return field(
        "clientY",
        float2,
        (client_y) => {
          return field(
            "deltaY",
            float2,
            (delta) => {
              return success(
                new UserZoomedViewport(client_x, client_y, delta)
              );
            }
          );
        }
      );
    }
  );
  return div(
    toList([
      id("container"),
      advanced("mousedown", handle_mousedown),
      (() => {
        let _pipe = on("wheel", handle_wheel);
        return prevent_default(_pipe);
      })(),
      style("touch-action", "none")
    ]),
    children2
  );
}
function view_viewport(children2) {
  return div(toList([id("viewport")]), children2);
}
function view_connection_line(handles, from_node2, from_handle, to2) {
  let result = try$(
    map_get(handles, from_node2),
    (handles2) => {
      return try$(
        map_get(handles2, from_handle),
        (from3) => {
          let $ = bezier(
            from3[0],
            from3[1],
            new Right(),
            to2[0],
            to2[1],
            new Left()
          );
          let path2;
          path2 = $[0];
          return new Ok(
            svg(
              toList([id("connection-line")]),
              toList([
                path(
                  toList([
                    attribute2("d", path2),
                    attribute2("fill", "none"),
                    attribute2("stroke", "#000"),
                    attribute2("stroke-width", "2")
                  ])
                )
              ])
            )
          );
        }
      );
    }
  );
  if (result instanceof Ok) {
    let svg2 = result[0];
    return svg2;
  } else {
    return none2();
  }
}
function view6(model) {
  return fragment2(
    toList([
      style2(
        toList([]),
        "\n      :host {\n          cursor: grab;\n          display: block;\n          position: relative;\n          width: 100%;\n          height: 100%;\n          contain: layout style paint;\n          will-change: scroll-position;\n      }\n\n      :host(:state(dragging)), :host(:state(connecting)) {\n        cursor: grabbing;\n      }\n\n      :host(:state(dragging)) #viewport {\n        will-change: transform;\n      }\n\n      #container {\n          position: relative;\n          width: 100%;\n          height: 100%;\n          overflow: hidden;\n          contain: layout paint;\n          backface-visibility: hidden;\n          transform: translate3d(0, 0, 0);\n          position: relative;\n      }\n\n      #viewport {\n          -moz-osx-font-smoothing: grayscale;\n          -webkit-font-smoothing: antialiased;\n          contain: layout style;\n          height: 100%;\n          image-rendering: -webkit-optimize-contrast;\n          image-rendering: crisp-edges;\n          isolation: isolate;\n          overflow: visible;\n          position: absolute;\n          text-rendering: optimizeLegibility;\n          transform-origin: 0 0;\n          transition: none;\n          width: 100%;\n      }\n\n      #connection-line {\n        width: 100%;\n        height: 100%;\n        overflow: visible;\n        position: absolute;\n        top: 0;\n        left: 0;\n        will-change: transform;\n        pointer-events: none;\n      }\n      "
      ),
      view_container(
        toList([
          named_slot("background", toList([]), toList([])),
          view_viewport(
            toList([
              default_slot(
                toList([
                  on_mount(
                    (var0, var1) => {
                      return new NodeMounted(var0, var1);
                    }
                  ),
                  on_change(
                    (var0, var1, var2) => {
                      return new NodeMoved(var0, var1, var2);
                    }
                  ),
                  on_connection_start(
                    (var0) => {
                      return new UserStartedConnection2(var0);
                    }
                  ),
                  on_connection_complete(
                    (_, _1) => {
                      return new UserCompletedConnection2();
                    }
                  )
                ]),
                toList([])
              ),
              (() => {
                let $ = model.connection;
                if ($ instanceof Some) {
                  let end = $[0][1];
                  let node2 = $[0][0][0];
                  let handle2 = $[0][0][1];
                  return view_connection_line(model.handles, node2, handle2, end);
                } else {
                  return none2();
                }
              })()
            ])
          ),
          named_slot("overlay", toList([]), toList([]))
        ])
      )
    ])
  );
}
var tag7 = "clique-viewport";
function register6() {
  return make_component(component(init8, update9, view6, options6()), tag7);
}
function root5(attributes, children2) {
  return element2(tag7, attributes, children2);
}

// build/dev/javascript/clique/clique.mjs
function root8(attributes, children2) {
  return root5(attributes, children2);
}
function background(attributes) {
  return root3(
    prepend(slot2("background"), attributes),
    toList([])
  );
}
function nodes(all) {
  return fragment3(all);
}
function node(id2, attributes, children2) {
  return root4(prepend(id(id2), attributes), children2);
}
function register7() {
  return try$(
    register(),
    (_) => {
      return try$(
        register2(),
        (_2) => {
          return try$(
            register5(),
            (_3) => {
              return try$(
                register4(),
                (_4) => {
                  return try$(
                    register3(),
                    (_5) => {
                      return try$(
                        register6(),
                        (_6) => {
                          return new Ok(void 0);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}
function transform2(value) {
  return transform(value);
}
function on_pan2(handler2) {
  return on_pan(handler2);
}
function on_zoom2(handler2) {
  return on_zoom(handler2);
}

// build/dev/javascript/plinth/date_ffi.mjs
function now() {
  return /* @__PURE__ */ new Date();
}
function hours(d) {
  return d.getHours();
}
function minutes(d) {
  return d.getMinutes();
}

// build/dev/javascript/renatillas/renatillas.ffi.mjs
function initializeTouchSupport() {
  function handleButtonClicks(e) {
    if (e.target.tagName === "CLIQUE-NODE") {
      const buttons = e.target.querySelectorAll("button, a");
      const nodeRect = e.target.getBoundingClientRect();
      const mouseX = e.clientX - nodeRect.left;
      const mouseY = e.clientY - nodeRect.top;
      for (const button2 of buttons) {
        const buttonRect = button2.getBoundingClientRect();
        const buttonX = buttonRect.left - nodeRect.left;
        const buttonY = buttonRect.top - nodeRect.top;
        if (mouseX >= buttonX && mouseX <= buttonX + buttonRect.width && mouseY >= buttonY && mouseY <= buttonY + buttonRect.height) {
          e.stopPropagation();
          e.preventDefault();
          button2.click();
          return;
        }
      }
    }
    if (e.target.tagName === "BUTTON" || e.target.tagName === "A") {
      e.stopPropagation();
    }
  }
  document.addEventListener("mousedown", handleButtonClicks, { capture: true });
  document.addEventListener("touchstart", handleButtonClicks, { capture: true, passive: false });
  let isDragging = false;
  let dragTarget = null;
  let canvasPanning = false;
  let initialTouchPos = { x: 0, y: 0 };
  function createMouseEvent(type, touch, target2 = null) {
    const mouseEvent = new MouseEvent(type, {
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: type === "mousedown" || type === "mousemove" ? 1 : 0
    });
    if (target2) {
      Object.defineProperty(mouseEvent, "target", { value: target2 });
    }
    return mouseEvent;
  }
  function findDragHandle(element4) {
    let current = element4;
    while (current && !current.classList.contains("touch-draggable")) {
      if (current.classList.contains("drag-handle")) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }
  function handleTouchStart(e) {
    const touch = e.touches[0];
    initialTouchPos = { x: touch.clientX, y: touch.clientY };
    const isButton = e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.hasAttribute("data-window-button") || e.target.closest("button") || e.target.closest("a");
    if (isButton) {
      return;
    }
    const draggableElement = e.target.closest(".touch-draggable");
    const dragHandle = findDragHandle(e.target);
    if (draggableElement && dragHandle) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      dragTarget = draggableElement;
      const mouseEvent = createMouseEvent("mousedown", touch, dragHandle);
      dragHandle.dispatchEvent(mouseEvent);
      return;
    }
    const cliqueViewport = e.target.closest("clique-viewport") || document.querySelector("clique-viewport");
    const cliqueBackground = e.target.closest("clique-background") || e.target.matches("clique-background") || e.target.tagName === "svg" && e.target.closest("clique-background") || e.target.tagName === "rect" && e.target.closest("clique-background");
    if ((cliqueViewport || cliqueBackground) && !draggableElement) {
      e.preventDefault();
      canvasPanning = true;
      let panTarget = cliqueViewport;
      if (cliqueViewport && cliqueViewport.shadowRoot) {
        const container = cliqueViewport.shadowRoot.querySelector("#container");
        if (container) {
          panTarget = container;
        }
      }
      if (!panTarget) {
        panTarget = document.querySelector("clique-viewport") || document.body;
      }
      const mouseEvent = createMouseEvent("mousedown", touch, panTarget);
      panTarget.dispatchEvent(mouseEvent);
      return;
    }
  }
  function handleTouchMove(e) {
    const isButton = e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.hasAttribute("data-window-button") || e.target.closest("button") || e.target.closest("a");
    if (isButton && !isDragging && !canvasPanning) return;
    if (!isDragging && !canvasPanning) return;
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    if (isDragging && dragTarget) {
      const mouseEvent = createMouseEvent("mousemove", touch);
      document.dispatchEvent(mouseEvent);
    } else if (canvasPanning) {
      const mouseEvent = createMouseEvent("mousemove", touch);
      document.dispatchEvent(mouseEvent);
    }
  }
  function handleTouchEnd(e) {
    if (!isDragging && !canvasPanning) return;
    e.preventDefault();
    e.stopPropagation();
    const mouseEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 0
    });
    document.dispatchEvent(mouseEvent);
    isDragging = false;
    dragTarget = null;
    canvasPanning = false;
  }
  function addTouchListeners() {
    document.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: false, capture: true });
    document.addEventListener("touchcancel", handleTouchEnd, { passive: false, capture: true });
    document.addEventListener("contextmenu", function(e) {
      if (e.target.closest(".touch-draggable") || e.target.closest("[data-clique-root]")) {
        e.preventDefault();
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addTouchListeners);
  } else {
    addTouchListeners();
  }
}

// build/dev/javascript/renatillas/renatillas/window.mjs
var Minimize = class extends CustomType {
};
var Maximize = class extends CustomType {
};
var Close = class extends CustomType {
};
var Window = class extends CustomType {
  constructor(name2, state, position2) {
    super();
    this.name = name2;
    this.state = state;
    this.position = position2;
  }
};
var Email = class extends CustomType {
};
var Skull = class extends CustomType {
};
var Header = class extends CustomType {
};
var About = class extends CustomType {
};
var Libraries = class extends CustomType {
};
var Sites = class extends CustomType {
};
var Homer = class extends CustomType {
};
var Dancing = class extends CustomType {
};
var Visible = class extends CustomType {
};
var Minimized = class extends CustomType {
};
var Maximized = class extends CustomType {
};
var Closed = class extends CustomType {
};
var WindowConfig = class extends CustomType {
  constructor(id2, title2, icon, position2, on_drag2, on_action, on_click2, content, width, is_maximized) {
    super();
    this.id = id2;
    this.title = title2;
    this.icon = icon;
    this.position = position2;
    this.on_drag = on_drag2;
    this.on_action = on_action;
    this.on_click = on_click2;
    this.content = content;
    this.width = width;
    this.is_maximized = is_maximized;
  }
};
var WindowPosition = class extends CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
};
function create_window_controls(on_action, is_maximized) {
  return div(
    toList([class$("flex gap-1")]),
    toList([
      button(
        toList([
          class$(
            "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#ffffff] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white "
          ),
          nodrag(),
          on_click(on_action(new Minimize()))
        ]),
        toList([text3("_")])
      ),
      button(
        toList([
          class$(
            "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#ffffff] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white "
          ),
          nodrag(),
          on_click(on_action(new Maximize()))
        ]),
        toList([
          text3(
            (() => {
              if (is_maximized) {
                return "\u2750";
              } else {
                return "\u25A1";
              }
            })()
          )
        ])
      ),
      button(
        toList([
          class$(
            "w-5 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs flex items-center justify-center text-black font-bold hover:bg-[#ffffff] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white "
          ),
          nodrag(),
          on_click(on_action(new Close()))
        ]),
        toList([text3("\xD7")])
      )
    ])
  );
}
function create_window(config) {
  return node(
    config.id,
    toList([
      position(
        (() => {
          let $ = config.is_maximized;
          if ($) {
            return [0, 0];
          } else {
            return config.position;
          }
        })()[0],
        (() => {
          let $ = config.is_maximized;
          if ($) {
            return [0, 0];
          } else {
            return config.position;
          }
        })()[1]
      ),
      on_drag(
        (() => {
          let $ = config.is_maximized;
          if ($) {
            return (_, _1, _2, _3, _4) => {
              return config.on_drag(config.position[0], config.position[1]);
            };
          } else {
            return (_, x, y, _1, _2) => {
              return config.on_drag(x, y);
            };
          }
        })()
      ),
      class$(
        (() => {
          let $ = config.is_maximized;
          if ($) {
            return "select-none";
          } else {
            return "select-none touch-draggable";
          }
        })()
      )
    ]),
    toList([
      div(
        toList([
          class$(
            (() => {
              let $ = config.is_maximized;
              if ($) {
                return "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-screen h-screen max-w-none " + config.width;
              } else {
                return "bg-[#c0c0c0] border-2 border-t-white max-w-sm border-l-white border-r-[#808080] border-b-[#808080] " + config.width;
              }
            })()
          ),
          on_click(config.on_click())
        ]),
        toList([
          div(
            toList([
              class$(
                "bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between drag-handle"
              )
            ]),
            toList([
              div(
                toList([class$("flex items-center gap-2")]),
                toList([
                  div(
                    toList([
                      class$(
                        "w-4 h-4 bg-[#c0c0c0] border border-[#808080] flex items-center justify-center text-xs text-black font-bold"
                      )
                    ]),
                    toList([text3(config.icon)])
                  ),
                  span(
                    toList([class$("font-bold text-sm pr-10 ")]),
                    toList([text3(config.title)])
                  )
                ])
              ),
              create_window_controls(config.on_action, config.is_maximized)
            ])
          ),
          config.content
        ])
      )
    ])
  );
}
function email_content() {
  return div(
    toList([
      class$(
        "p-2 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1"
      )
    ]),
    toList([
      img(
        toList([
          src("/priv/static/email.gif"),
          alt("Email animation"),
          class$("w-24 h-24 pixelated")
        ])
      )
    ])
  );
}
function dancing_content() {
  return div(
    toList([
      class$(
        "p-2 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1"
      )
    ]),
    toList([
      img(
        toList([
          src("/priv/static/dancing.gif"),
          alt("Dancing animation"),
          class$("w-24 h-24 pixelated")
        ])
      )
    ])
  );
}
function homer_content() {
  return div(
    toList([
      class$(
        "bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-1"
      )
    ]),
    toList([
      img(
        toList([
          src("/priv/static/homer.gif"),
          alt("Homer Simpson"),
          class$("pixelated bg-white")
        ])
      )
    ])
  );
}
function skull_content() {
  return div(
    toList([
      class$(
        "p-2 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-1"
      )
    ]),
    toList([
      img(
        toList([
          src("/priv/static/skull.gif"),
          alt("Skull animation"),
          class$("w-20 h-20 pixelated")
        ])
      )
    ])
  );
}
function header_content() {
  return div(
    toList([
      class$(
        "p-6 text-center bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2"
      )
    ]),
    toList([
      h1(
        toList([class$("text-4xl font-bold text-[#000080] mb-2")]),
        toList([text3("RENATA AMUTIO")])
      ),
      p(
        toList([class$("text-lg text-black")]),
        toList([text3("GLEAM DEVELOPER \u2022 FUNCTIONAL PROGRAMMING ENTHUSIAST")])
      ),
      div(
        toList([
          class$(
            "flex justify-center gap-8 mt-4 p-4 bg-[#c0c0c0] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040]"
          )
        ]),
        toList([
          div(
            toList([class$("text-center")]),
            toList([
              span(
                toList([class$("text-2xl font-bold text-[#0000ff] block")]),
                toList([text3("17+")])
              ),
              span(
                toList([class$("text-xs text-black font-bold")]),
                toList([text3("LIBRARIES")])
              )
            ])
          ),
          div(
            toList([class$("text-center")]),
            toList([
              span(
                toList([class$("text-2xl font-bold text-[#0000ff] block")]),
                toList([text3("3")])
              ),
              span(
                toList([class$("text-xs text-black font-bold")]),
                toList([text3("PROD SITES")])
              )
            ])
          ),
          div(
            toList([class$("text-center")]),
            toList([
              span(
                toList([class$("text-2xl font-bold text-[#0000ff] block")]),
                toList([text3("100%")])
              ),
              span(
                toList([class$("text-xs text-black font-bold")]),
                toList([text3("GLEAM")])
              )
            ])
          )
        ])
      )
    ])
  );
}
function about_content() {
  return div(
    toList([
      class$(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2 flex gap-4 items-start"
      )
    ]),
    toList([
      div(
        toList([class$("flex-1")]),
        toList([
          p(
            toList([class$("text-black leading-relaxed text-sm")]),
            toList([
              text3(
                "Welcome to my digital space! I'm a passionate Gleam developer who believes in the power of functional programming and type safety. When I'm not crafting elegant Gleam libraries, you'll find me building production web applications that users actually love."
              )
            ])
          )
        ])
      )
    ])
  );
}
function libraries_content() {
  return div(
    toList([
      class$(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2"
      )
    ]),
    toList([
      h3(
        toList([class$("text-lg font-bold text-[#000080] mb-3")]),
        toList([text3("17+ Open Source Libraries")])
      ),
      p(
        toList([class$("text-black leading-relaxed text-sm mb-4")]),
        toList([
          text3(
            "Crafted with precision using Gleam's powerful type system. Each library solves real problems while maintaining elegant APIs and comprehensive documentation."
          )
        ])
      ),
      a(
        toList([
          href("https://github.com/renatillas"),
          target("_blank"),
          class$(
            "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
          ),
          nodrag()
        ]),
        toList([text3("Github")])
      )
    ])
  );
}
function sites_content() {
  return div(
    toList([
      class$(
        "p-4 bg-[#ffffff] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] m-2"
      )
    ]),
    toList([
      div(
        toList([class$("space-y-4")]),
        toList([
          div(
            toList([]),
            toList([
              h3(
                toList([class$("text-lg font-bold text-[#000080] mb-2")]),
                toList([text3("La Tienda de Helen")])
              ),
              p(
                toList([class$("text-black text-sm mb-2")]),
                toList([
                  text3("E-commerce platform built with modern web technologies")
                ])
              ),
              a(
                toList([
                  href("https://latiendadehelen.com"),
                  target("_blank"),
                  class$(
                    "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  ),
                  nodrag()
                ]),
                toList([text3("Visit Site")])
              )
            ])
          ),
          div(
            toList([]),
            toList([
              h3(
                toList([class$("text-lg font-bold text-[#000080] mb-2")]),
                toList([text3("Keitepinxa Studio")])
              ),
              p(
                toList([class$("text-black text-sm mb-2")]),
                toList([
                  text3("Creative studio website showcasing digital artistry")
                ])
              ),
              a(
                toList([
                  href("https://keitepinxa.studio"),
                  target("_blank"),
                  class$(
                    "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  ),
                  nodrag()
                ]),
                toList([text3("Visit Site")])
              )
            ])
          ),
          div(
            toList([]),
            toList([
              h3(
                toList([class$("text-lg font-bold text-[#000080] mb-2")]),
                toList([text3("Santomot")])
              ),
              p(
                toList([class$("text-black text-sm mb-2")]),
                toList([text3("A MTG custom cards shop")])
              ),
              a(
                toList([
                  href("https://santomot.com"),
                  target("_blank"),
                  class$(
                    "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  ),
                  nodrag()
                ]),
                toList([text3("Visit Site")])
              )
            ])
          )
        ])
      )
    ])
  );
}
function name_to_string(name2) {
  if (name2 instanceof Email) {
    return "email";
  } else if (name2 instanceof Skull) {
    return "skull";
  } else if (name2 instanceof Header) {
    return "portfolio";
  } else if (name2 instanceof About) {
    return "about-me";
  } else if (name2 instanceof Libraries) {
    return "libraries";
  } else if (name2 instanceof Sites) {
    return "sites";
  } else if (name2 instanceof Homer) {
    return "homer";
  } else {
    return "dancing";
  }
}
function name_to_title(name2) {
  if (name2 instanceof Email) {
    return "email.gif - Paint";
  } else if (name2 instanceof Skull) {
    return "skull.gif - Media Player";
  } else if (name2 instanceof Header) {
    return "Renata Amutio - Portfolio";
  } else if (name2 instanceof About) {
    return "About Me - Properties";
  } else if (name2 instanceof Libraries) {
    return "My Libraries - Folder";
  } else if (name2 instanceof Sites) {
    return "My Sites - Folder";
  } else if (name2 instanceof Homer) {
    return "homer.gif - Media Player";
  } else {
    return "dancing.gif - Media Player";
  }
}
function name_to_icon(name2) {
  if (name2 instanceof Email) {
    return "\u{1F4E7}";
  } else if (name2 instanceof Skull) {
    return "\u{1F480}";
  } else if (name2 instanceof Header) {
    return "R";
  } else if (name2 instanceof About) {
    return "?";
  } else if (name2 instanceof Libraries) {
    return "\u{1F4C1}";
  } else if (name2 instanceof Sites) {
    return "\u{1F310}";
  } else if (name2 instanceof Homer) {
    return "\u{1F3B5}";
  } else {
    return "\u{1F483}";
  }
}
function create_window_with_content(window2, on_drag2, on_action, on_click2, content) {
  let _pipe = new WindowConfig(
    name_to_string(window2.name),
    name_to_title(window2.name),
    name_to_icon(window2.name),
    [window2.position.x, window2.position.y],
    on_drag2,
    on_action,
    on_click2,
    content,
    "",
    isEqual(window2.state, new Maximized())
  );
  return create_window(_pipe);
}

// build/dev/javascript/renatillas/renatillas.mjs
var FILEPATH = "src/renatillas.gleam";
var Model7 = class extends CustomType {
  constructor(transform3, window_states, start_menu_visible, current_time, timer_id) {
    super();
    this.transform = transform3;
    this.window_states = window_states;
    this.start_menu_visible = start_menu_visible;
    this.current_time = current_time;
    this.timer_id = timer_id;
  }
};
var UserDraggedWindow = class extends CustomType {
  constructor(window2) {
    super();
    this.window = window2;
  }
};
var UserActivatedWindowControl = class extends CustomType {
  constructor(name2, action) {
    super();
    this.name = name2;
    this.action = action;
  }
};
var UserClickedWindow = class extends CustomType {
  constructor(name2) {
    super();
    this.name = name2;
  }
};
var RestoreWindow = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var ToggleStartMenu = class extends CustomType {
};
var UpdateTime = class extends CustomType {
};
var ViewportPanned = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
function format_time() {
  let now2 = now();
  let hours2 = hours(now2);
  let _block;
  let _pipe = minutes(now2);
  let _pipe$1 = to_string(_pipe);
  _block = pad_start(_pipe$1, 2, "0");
  let minutes2 = _block;
  return (() => {
    let _pipe$2 = hours2;
    return to_string(_pipe$2);
  })() + ":" + minutes2;
}
function init9(_) {
  return new Model7(
    [0, 0, 0.8],
    toList([
      new Window(new Skull(), new Visible(), new WindowPosition(1100, 10)),
      new Window(new Email(), new Visible(), new WindowPosition(1200, 120)),
      new Window(new About(), new Visible(), new WindowPosition(10, 320)),
      new Window(new Libraries(), new Visible(), new WindowPosition(0, 530)),
      new Window(new Sites(), new Visible(), new WindowPosition(450, 0)),
      new Window(new Homer(), new Visible(), new WindowPosition(600, 250)),
      new Window(
        new Dancing(),
        new Visible(),
        new WindowPosition(1200, 400)
      ),
      new Window(new Header(), new Visible(), new WindowPosition(300, 150))
    ]),
    false,
    format_time(),
    new None()
  );
}
function update10(model, msg) {
  if (msg instanceof UserDraggedWindow) {
    let name2 = msg.window.name;
    let state = msg.window.state;
    let position2 = msg.window.position;
    let new_window = new Window(name2, state, position2);
    let old_windows = filter(
      model.window_states,
      (w) => {
        return !isEqual(w.name, name2);
      }
    );
    return new Model7(
      model.transform,
      prepend(new_window, old_windows),
      model.start_menu_visible,
      model.current_time,
      model.timer_id
    );
  } else if (msg instanceof UserActivatedWindowControl) {
    let name2 = msg.name;
    let action = msg.action;
    if (action instanceof Minimize) {
      let $ = find2(
        model.window_states,
        (w) => {
          return isEqual(w.name, name2);
        }
      );
      let old_window;
      if ($ instanceof Ok) {
        old_window = $[0];
      } else {
        throw makeError(
          "let_assert",
          FILEPATH,
          "renatillas",
          99,
          "update",
          "Pattern match failed, no pattern matched the value.",
          {
            value: $,
            start: 3077,
            end: 3173,
            pattern_start: 3088,
            pattern_end: 3102
          }
        );
      }
      let new_window = new Window(name2, new Minimized(), old_window.position);
      let old_windows = filter(
        model.window_states,
        (w) => {
          return !isEqual(w.name, name2);
        }
      );
      return new Model7(
        model.transform,
        prepend(new_window, old_windows),
        model.start_menu_visible,
        model.current_time,
        model.timer_id
      );
    } else if (action instanceof Maximize) {
      let $ = find2(
        model.window_states,
        (w) => {
          return isEqual(w.name, name2);
        }
      );
      let old_window;
      if ($ instanceof Ok) {
        old_window = $[0];
      } else {
        throw makeError(
          "let_assert",
          FILEPATH,
          "renatillas",
          107,
          "update",
          "Pattern match failed, no pattern matched the value.",
          {
            value: $,
            start: 3463,
            end: 3559,
            pattern_start: 3474,
            pattern_end: 3488
          }
        );
      }
      let new_window = new Window(
        name2,
        (() => {
          let $1 = old_window.state;
          if ($1 instanceof Maximized) {
            return new Visible();
          } else {
            return new Maximized();
          }
        })(),
        old_window.position
      );
      let old_windows = filter(
        model.window_states,
        (w) => {
          return !isEqual(w.name, name2);
        }
      );
      return new Model7(
        model.transform,
        prepend(new_window, old_windows),
        model.start_menu_visible,
        model.current_time,
        model.timer_id
      );
    } else {
      let $ = find2(
        model.window_states,
        (w) => {
          return isEqual(w.name, name2);
        }
      );
      let old_window;
      if ($ instanceof Ok) {
        old_window = $[0];
      } else {
        throw makeError(
          "let_assert",
          FILEPATH,
          "renatillas",
          123,
          "update",
          "Pattern match failed, no pattern matched the value.",
          {
            value: $,
            start: 4013,
            end: 4109,
            pattern_start: 4024,
            pattern_end: 4038
          }
        );
      }
      let new_window = new Window(name2, new Closed(), old_window.position);
      let old_windows = filter(
        model.window_states,
        (w) => {
          return !isEqual(w.name, name2);
        }
      );
      return new Model7(
        model.transform,
        prepend(new_window, old_windows),
        model.start_menu_visible,
        model.current_time,
        model.timer_id
      );
    }
  } else if (msg instanceof UserClickedWindow) {
    let name2 = msg.name;
    let $ = find2(
      model.window_states,
      (w) => {
        return isEqual(w.name, name2);
      }
    );
    let clicked_window;
    if ($ instanceof Ok) {
      clicked_window = $[0];
    } else {
      throw makeError(
        "let_assert",
        FILEPATH,
        "renatillas",
        90,
        "update",
        "Pattern match failed, no pattern matched the value.",
        {
          value: $,
          start: 2701,
          end: 2797,
          pattern_start: 2712,
          pattern_end: 2730
        }
      );
    }
    let other_windows = filter(
      model.window_states,
      (w) => {
        return !isEqual(w.name, name2);
      }
    );
    return new Model7(
      model.transform,
      prepend(clicked_window, other_windows),
      model.start_menu_visible,
      model.current_time,
      model.timer_id
    );
  } else if (msg instanceof RestoreWindow) {
    let name2 = msg[0].name;
    let position2 = msg[0].position;
    let new_window = new Window(name2, new Visible(), position2);
    let old_windows = filter(
      model.window_states,
      (w) => {
        return !isEqual(w.name, name2);
      }
    );
    return new Model7(
      model.transform,
      prepend(new_window, old_windows),
      model.start_menu_visible,
      model.current_time,
      model.timer_id
    );
  } else if (msg instanceof ToggleStartMenu) {
    return new Model7(
      model.transform,
      model.window_states,
      !model.start_menu_visible,
      model.current_time,
      model.timer_id
    );
  } else if (msg instanceof UpdateTime) {
    return new Model7(
      model.transform,
      model.window_states,
      model.start_menu_visible,
      format_time(),
      model.timer_id
    );
  } else {
    let transform3 = msg[0];
    return new Model7(
      transform3,
      model.window_states,
      model.start_menu_visible,
      model.current_time,
      model.timer_id
    );
  }
}
function create_window_element(window2) {
  let $ = window2.state;
  if ($ instanceof Minimized) {
    return ["", div(toList([]), toList([]))];
  } else if ($ instanceof Closed) {
    return ["", div(toList([]), toList([]))];
  } else {
    let name2 = window2.name;
    let state = $;
    return [
      name_to_string(name2),
      create_window_with_content(
        window2,
        (x, y) => {
          return new UserDraggedWindow(
            new Window(name2, state, new WindowPosition(x, y))
          );
        },
        (action) => {
          return new UserActivatedWindowControl(name2, action);
        },
        () => {
          return new UserClickedWindow(name2);
        },
        (() => {
          if (name2 instanceof Email) {
            return email_content();
          } else if (name2 instanceof Skull) {
            return skull_content();
          } else if (name2 instanceof Header) {
            return header_content();
          } else if (name2 instanceof About) {
            return about_content();
          } else if (name2 instanceof Libraries) {
            return libraries_content();
          } else if (name2 instanceof Sites) {
            return sites_content();
          } else if (name2 instanceof Homer) {
            return homer_content();
          } else {
            return dancing_content();
          }
        })()
      )
    ];
  }
}
function create_taskbar_button(title2, icon, window2) {
  return button(
    toList([
      class$(
        "bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1 text-black text-xs font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white max-w-32 truncate"
      ),
      on_click(new RestoreWindow(window2))
    ]),
    toList([span(toList([class$("mr-1")]), toList([text2(icon)])), text2(title2)])
  );
}
function get_closed_windows(window_states) {
  let windows = filter(
    window_states,
    (w) => {
      return isEqual(w.state, new Closed());
    }
  );
  return map(
    windows,
    (w) => {
      return create_taskbar_button(
        name_to_string(w.name),
        name_to_icon(w.name),
        w
      );
    }
  );
}
function get_minimized_windows(window_states) {
  let windows = filter(
    window_states,
    (w) => {
      return isEqual(w.state, new Minimized());
    }
  );
  return map(
    windows,
    (w) => {
      return create_taskbar_button(
        name_to_string(w.name),
        name_to_icon(w.name),
        w
      );
    }
  );
}
function task_bar(model) {
  return div(
    toList([
      class$(
        "fixed max-h-12 bottom-0 left-0 right-0 bg-[#c0c0c0] border-t-2 border-t-white p-2 flex items-center justify-between z-50"
      )
    ]),
    toList([
      div(
        toList([class$("flex items-center gap-2")]),
        prepend(
          button(
            toList([
              class$(
                "bg-[#008000] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] px-3 py-1 flex items-center gap-2 text-white font-bold text-sm hover:bg-[#009000] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
              ),
              on_click(new ToggleStartMenu())
            ]),
            toList([
              span(toList([class$("text-lg")]), toList([text2("\u{1F7E2}")])),
              text2("Start")
            ])
          ),
          get_minimized_windows(model.window_states)
        )
      ),
      div(
        toList([class$("flex-1 text-center")]),
        toList([
          p(
            toList([class$("text-black text-xs font-bold")]),
            toList([text2("BUILT WITH \u2665 GLEAM")])
          )
        ])
      ),
      div(
        toList([
          class$(
            "bg-[#008080] border border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#404040] border-b-[#404040] px-2 py-1 text-white text-xs font-bold"
          )
        ]),
        toList([text2(model.current_time)])
      )
    ])
  );
}
function view7(model) {
  return html(
    toList([]),
    toList([
      head(
        toList([]),
        toList([
          title(toList([]), "renata amutio - gleam developer"),
          link(
            toList([
              rel("stylesheet"),
              href(
                "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
              )
            ])
          )
        ])
      ),
      body(
        toList([
          class$(
            "min-h-screen bg-[#008080] font-['MS_Sans_Serif'] text-black overflow-x-hidden"
          )
        ]),
        toList([
          root8(
            toList([
              class$("w-full h-full absolute inset-0 clique-root"),
              attribute2("data-clique-root", "true"),
              transform2(model.transform),
              on_pan2((var0) => {
                return new ViewportPanned(var0);
              }),
              on_zoom2((var0) => {
                return new ViewportPanned(var0);
              })
            ]),
            toList([
              background(
                toList([
                  lines(),
                  class$("text-gray-200/20"),
                  gap(50, 50)
                ])
              ),
              nodes(
                map(
                  reverse(model.window_states),
                  (window2) => {
                    return create_window_element(window2);
                  }
                )
              )
            ])
          ),
          (() => {
            let $ = model.start_menu_visible;
            if ($) {
              return div(
                toList([
                  class$(
                    "fixed bottom-12 left-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-lg z-50 min-w-48 max-h-64 overflow-y-auto"
                  )
                ]),
                toList([
                  div(
                    toList([
                      class$(
                        "p-2 border-b border-[#808080] bg-gradient-to-r from-[#000080] to-[#0000ff] text-white text-sm font-bold"
                      )
                    ]),
                    toList([text2("Closed Applications")])
                  ),
                  div(
                    toList([class$("p-1")]),
                    get_closed_windows(model.window_states)
                  )
                ])
              );
            } else {
              return div(toList([]), toList([]));
            }
          })(),
          task_bar(model)
        ])
      )
    ])
  );
}
function main() {
  let $ = register7();
  if (!($ instanceof Ok)) {
    throw makeError(
      "let_assert",
      FILEPATH,
      "renatillas",
      24,
      "main",
      "Pattern match failed, no pattern matched the value.",
      { value: $, start: 751, end: 787, pattern_start: 762, pattern_end: 767 }
    );
  }
  initializeTouchSupport();
  let app = simple(init9, update10, view7);
  let $1 = start3(app, "#app", void 0);
  if (!($1 instanceof Ok)) {
    throw makeError(
      "let_assert",
      FILEPATH,
      "renatillas",
      27,
      "main",
      "Pattern match failed, no pattern matched the value.",
      { value: $1, start: 865, end: 914, pattern_start: 876, pattern_end: 881 }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
