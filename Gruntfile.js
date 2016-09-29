/**!
 * Proxy Node - Gruntfile
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        // Task configuration.
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            server: {
                src: 'server.js'
            },
            app: {
                src: 'app/**/*.js'
            },
            Gruntfile: {
                src: 'Gruntfile.js'
            },
            testjs: {
                src: 'test/**/*.js'
            }
        },
        watch: {
            /*
            html: {
                files: ['public/views/**'],
                options: {
                    livereload: true,
                },
            },
            js: {
                files: ['public/js/**'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: ['public/less/**'],
                tasks: ['less'],
                options: {
                    livereload: true,
                },
            }*/
        },
        jsbeautifier: {
            "default": {
                src: [
                    '*.js',
                    'config/*.js',
                    'config/**/*.js',
                    'app/**/*.js'
                ],
                options: {
                    js: {
                        braceStyle: "collapse",
                        breakChainedMethods: false,
                        e4x: false,
                        evalCode: false,
                        indentChar: " ",
                        indentLevel: 0,
                        indentSize: 4,
                        indentWithTabs: false,
                        jslintHappy: false,
                        keepArrayIndentation: false,
                        keepFunctionIndentation: false,
                        maxPreserveNewlines: 10,
                        preserveNewlines: true,
                        spaceBeforeConditional: true,
                        spaceInParen: false,
                        unescapeStrings: false,
                        wrapLineLength: 0
                    }
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'proxy.js',
                    //nodeArgs: ['--debug'],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js', 'hbs'],
                    watchedFolders: ['app', 'config', 'lib', 'middleware'],
                    debug: true,
                    legacyWatch: true,
                    delayTime: 3,
                    args: ['--debug=6868'],
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        'node-inspector': {
            dev: {
                options: {
                    //'web-port': 1338,
                    //'web-host': 'localhost',
                    //'debug-port': 6868,
                    'save-live-edit': true,
                    'stack-trace-limit': 4
                }
            }
        },
        concurrent: {
            target: {
                tasks: ['jsbeautifier', 'nodemon', /*'node-inspector',*/ 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    //grunt.loadNpmTasks('grunt-contrib-less');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-node-inspector');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    // Default task.
    //grunt.registerTask('default', ['jshint', 'nodeunit', 'clean', 'uglify']);
    //grunt.registerTask('test', ['jshint', 'nodeunit']);

    grunt.registerTask('default', ['jshint', 'jsbeautifier', 'concurrent:target']);
};
