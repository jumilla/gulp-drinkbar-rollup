
const PLUGIN_NAME = 'gulp-drinkbar-rollup'

import through from 'through2'
import gutil from 'gulp-util'
import {rollup} from 'rollup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import assing from 'object-assign'



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



function rollupStream(options = {}) {
	if (typeof options === 'string') {
		options = {dest: options}
	}

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
						file.path = file.base + options.dest
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

	return through.obj(transform)
}



rollupStream.nodeResolve = nodeResolve
rollupStream.commonjs = commonjs



module.exports = rollupStream
