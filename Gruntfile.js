module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        ts: {
            default: {
                files: [{src: ['src/mtemplatejs.ts'], dest: 'dist/jquery-mtemplatejs.js'}],
                options: {
                    sourceMap: false,
                    module: 'amd'
                }
            }
        },
        uglify: {
            default: {
                files: {
                    'dist/jquery-mtemplatejs.min.js': ['dist/jquery-mtemplatejs.js']
                }
            },
            options: {
                compress: {
                    drop_console: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', [
        'ts', 'uglify'
    ]);

};