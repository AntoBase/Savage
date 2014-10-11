module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist_js: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
            dist_css: {
                src: ['src/**/*.css'],
                dest: 'dist/<%= pkg.name %>.css'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist_js: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist_js.dest %>']
                }
            }
        },
        watch: {
            src: {
                files: ['src/**/*'],
                tasks: ['concat', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
};