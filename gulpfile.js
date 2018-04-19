const gulp = require('gulp');
const webpack = require('webpack');
const gutil = require('gulp-util');
const ts = require('gulp-typescript');
const path = require('path');
const del = require('del');


gulp.task('html-webpack', (done) => {
    const config = require('./src/views/webpack.config.js');
    config.context = `${__dirname}/src/views`;
    return webpack(config, (err, stats) => {
        const statsJson = stats.toJson();
        if (err || (statsJson.errors && statsJson.errors.length)) {
            statsJson.errors.forEach(webpackError => {
                gutil.log(gutil.colors.red(`Error (webpack): ${webpackError}`));
            });

            throw new gutil.PluginError('webpack', JSON.stringify(err || statsJson.errors));
        }
        gutil.log('[webpack]', stats.toString());
        done();
    });
});

gulp.task('ts-compile', () => {
    const tsProject = ts.createProject('./tsconfig.json');
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('.', {
            mapSources: (sourcePath, file) => {
                // Correct source map path.
                const relativeSourcePath = path.relative(path.dirname(file.path), path.join(file.base, sourcePath));
                return relativeSourcePath;
            }
        }))
        .pipe(gulp.dest('out'));
});

gulp.task('clean', () => {
    return del('out');
});

gulp.task('build', ['clean', 'ts-compile', 'html-webpack']);

gulp.task('build_without_view', ['clean', 'ts-compile']);

gulp.task('watch', () => {
    gulp.watch(['./src/**/*', './test/**/*', '!./src/views/**/*'], ['ts-compile']);
    gulp.watch(['./src/views/**/*', '!./src/views/node_modules/**'], ['html-webpack']);
});
