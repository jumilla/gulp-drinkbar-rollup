
const PLUGIN_NAME = 'drinkbar-stream-rollup'

import through from 'through2'
import gutil from 'gulp-util'
import {rollup} from 'rollup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import assing from 'object-assign'
import File from 'vinyl'



const defaultRollupOptions = {
	plugins: [
		nodeResolve({jsnext: true}),
		commonjs(),
	],
}



const defaultBundleOptions = {
	format: 'umd',
	moduleName: 'main',
}



module.exports = function (options = {}) {
	const transform = function (file, encode, done) {
		const stream = this

		if (file.isNull()) {
			stream.push(file)
			done()
		}
		else if (file.isStream()) {
			stream.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			done()
		}
		else {
			const rollupOptions = assing({}, defaultRollupOptions, {entry: file.path}, options)
			const bundleOptions = assing({}, defaultBundleOptions, options)

			rollup(rollupOptions)
				.then(bundle => {
					const result = bundle.generate(bundleOptions)

					if (options.dest) {
						file.path = options.dest
					}
					file.contents = new Buffer(result.code)
					file.sourcemap = result.map

					stream.push(file)
					done()
				})
				.catch(error => {
					setImmediate(() => {
						stream.emit('error', new gutil.PluginError(PLUGIN_NAME, error.message));
						done()						
					})
				})
		}
	}

	const flush = function(done) {
		console.log('flush')

		done()
	}

	return through.obj(transform)
}



module.exports.nodeResolve = nodeResolve
module.exports.commonjs = commonjs

