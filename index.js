'use strict';

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _rollup = require('rollup');

var _rollupPluginNodeResolve = require('rollup-plugin-node-resolve');

var _rollupPluginNodeResolve2 = _interopRequireDefault(_rollupPluginNodeResolve);

var _rollupPluginCommonjs = require('rollup-plugin-commonjs');

var _rollupPluginCommonjs2 = _interopRequireDefault(_rollupPluginCommonjs);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGIN_NAME = 'drinkbar-stream-rollup';

var defaultRollupOptions = {
	plugins: [(0, _rollupPluginNodeResolve2.default)({ jsnext: true }), (0, _rollupPluginCommonjs2.default)()]
};

var defaultBundleOptions = {
	format: 'umd',
	moduleName: 'main'
};

function rollupStream() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	if (typeof options === 'string') {
		options = { dest: options };
	}

	var transform = function transform(file, encode, done) {
		var stream = this;

		if (file.isNull()) {
			stream.push(file);
			done();
		} else if (file.isStream()) {
			stream.emit('error', new _gulpUtil2.default.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			done();
		} else {
			(function () {
				var rollupOptions = (0, _objectAssign2.default)({}, defaultRollupOptions, { entry: file.path }, options);
				var bundleOptions = (0, _objectAssign2.default)({}, defaultBundleOptions, options);

				(0, _rollup.rollup)(rollupOptions).then(function (bundle) {
					var result = bundle.generate(bundleOptions);

					if (options.dest) {
						file.path = file.base + options.dest;
					}
					file.contents = new Buffer(result.code);
					file.sourcemap = result.map;

					stream.push(file);
					done();
				}).catch(function (error) {
					setImmediate(function () {
						stream.emit('error', new _gulpUtil2.default.PluginError(PLUGIN_NAME, error.message));
						done();
					});
				});
			})();
		}
	};

	return _through2.default.obj(transform);
}

rollupStream.nodeResolve = _rollupPluginNodeResolve2.default;
rollupStream.commonjs = _rollupPluginCommonjs2.default;

module.exports = rollupStream;