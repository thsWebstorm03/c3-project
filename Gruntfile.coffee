module.exports = (grunt) ->
    require('load-grunt-tasks') grunt, pattern: 'grunt-contrib-*'

    grunt.initConfig
        watch:
          concat:
            tasks: 'concat'
            files: ['src/*.js']

        concat:
          dist:
            options:
              process: (src, filepath) ->
                if filepath != 'src/head.js' && filepath != 'src/tail.js'
                  lines = []
                  src.split('\n').forEach (line) ->
                    lines.push( (if line.length > 0 then '    ' else '') + line)
                  src = lines.join('\n')
                return src
            src: [
              'src/head.js',
              'src/core.js',
              'src/config.js',
              'src/scale.js',
              'src/domain.js',
              'src/data.js',
              'src/data.convert.js',
              'src/data.load.js',
              'src/category.js',
              'src/size.js',
              'src/shape.js',
              'src/shape.bar.js',
              'src/text.js',
              'src/type.js',
              'src/grid.js',
              'src/tooltip.js',
              'src/legend.js',
              'src/axis.js',
              'src/clip.js',
              'src/arc.js',
              'src/region.js',
              'src/drag.js',
              'src/selection.js',
              'src/subchart.js',
              'src/zoom.js',
              'src/color.js',
              'src/format.js',
              'src/cache.js',
              'src/class.js',
              'src/util.js',
              'src/api.js',
              'src/c3.axis.js',
              'src/tail.js'
            ]
            dest: 'c3.js'

        jshint:
          c3: 'c3.js'
          spec: 'spec/*.js'
          options:
            jshintrc: '.jshintrc'

        jasmine:
          c3:
            src: 'c3.js'
            options:
              specs: 'spec/*.js'

        uglify:
          c3:
            files:
              'c3.min.js': 'c3.js'

    grunt.registerTask 'default', ['concat', 'jshint', 'jasmine', 'uglify']
