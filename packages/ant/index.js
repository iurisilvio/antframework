/**
 * Exports the {@link Ant} and the {@link Config} classes that can be used to
 * initialize and run the framework functionalities. It additionally exports the
 * following artifacts that can be used to extend the framework:
 * - The {@link AntFunction} class that can be used to create new functions.
 * - The {@link BinFunction} class that can be used to create new bin functions.
 * - The {@link Runtime} class that can be used to create new runtime functions.
 * - The {@link LibFunction} class that can be used to create new lib functions.
 * - The {@link Plugin} class that can be used to create new plugins.
 * - The {@link Template} class that can be used to create new templates.
 * - The {@link Provider} class that can be used to create new host providers to
 * deploy the functions.
 * - The {@link Core} plugin that can be extended.
 * - The {@link GraphQL} plugin that can be extended.
 * - The [antframework/lib/util]{@link module:antframework/lib/util} module that can be used when extending
 * the framework.
 * @module antframework
 */

const Ant = require('./lib/Ant');
const Config = require('./lib/config/Config');
const Plugin = require('./lib/plugins/Plugin');
const Template = require('./lib/templates/Template');
const Core = require('./lib/plugins/core');
const GraphQL = require('./lib/plugins/graphQL');
const AntFunction = require('./lib/functions/AntFunction');
const BinFunction = require('./lib/functions/BinFunction');
const LibFunction = require('./lib/functions/LibFunction');
const Provider = require('./lib/hosts/providers/Provider');
const util = require('./lib/util');

module.exports.Ant = Ant;
module.exports.Config = Config;
module.exports.AntFunction = AntFunction;
module.exports.BinFunction = BinFunction;
module.exports.LibFunction = LibFunction;
module.exports.Plugin = Plugin;
module.exports.Template = Template;
module.exports.Core = Core;
module.exports.GraphQL = GraphQL;
module.exports.Provider = Provider;
module.exports.util = util;