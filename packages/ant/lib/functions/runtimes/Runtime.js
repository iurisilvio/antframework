/**
 * @fileoverview Defines and exports the {@link Runtime} class.
 */

const assert = require('assert');
const BinFunction = require('../BinFunction');

/**
 * @class ant/Runtime
 * Represents a function that contains a binary file that will be used to
 * execute a lib function.
 * @extends BinFunction
 */
class Runtime extends BinFunction {
  /**
   * @param {!Ant} ant The {@link Ant} framework instance that is initializing
   * the function.
   * @param {!String} name The function name.
   * @param {!String} bin The path to the bin file.
   * @param {Array<String>} extensions An array of the extensions that this
   * runtime supports to execute.
   * @param {String} template The path to the file to be used as template
   * when creating new functions with this runtime
   * @throws {AssertionError} If "ant", "name", "bin" or "extensions" params are
   * not valid.
   */
  constructor(ant, name, bin, extensions, template) {
    super(ant, name, bin);

    assert(
      !extensions || extensions instanceof Array,
      'Could not initialize Runtime: param "extensions" should be Array'
    );

    /**
     * Contains the extensions that this runtime supports to execute.
     * @type {Array<String>}
     * @private
     */
    this._extensions = extensions;

    /**
     * The path to the file to be used as template when creating new
     * functions with this runtime.
     * @type {String}
     * @private
     */
    this._template = template;
  }

  /**
   * Contains the extensions that this runtime supports to execute.
   * @type {Array<String>}
   * @readonly
   */
  get extensions() {
    return this._extensions;
  }

  /**
   * Returns the path to the file to be used as template when creating
   * new functions with this runtime.
   * @type {String}
   */
  get template() {
    return this._template;
  }
}

module.exports = Runtime;
