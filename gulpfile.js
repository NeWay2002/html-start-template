var gulp           = require('gulp'),
    browserSync    = require('browser-sync').create(),
    sass           = require('gulp-sass'),
    gutil          = require('gulp-util' ),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		notify         = require("gulp-notify"),
		spritesmith    = require('gulp.spritesmith'),
		watch          = require('gulp-chokidar')(gulp),
		combine        = require('stream-combiner');

// Static Server + watching sass/html files
gulp.task('serve', ['sass', 'sass-libs', 'sass-media', 'js', 'watch-gulp'], function() {

    browserSync.init({
        server: {
       			baseDir: "app"
        },
        notify: false,
        // tunnel: true,
				// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });

    gulp.watch("app/sass/*.sass", ['sass', 'sass-media', 'sass-libs']).on('change', browserSync.reload);
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js', 'common-js']).on('change', browserSync.reload);

 });

gulp.task('watch-gulp', function () {
    watch('app/img/sprites/*.*', 'sprite');
});


gulp.task('sprite', function () {
    var spriteData = gulp.src('app/img/sprites/*.*').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.sass',
        imgPath :  '../img/sprite.png',
        cssFormat: 'sass',
        padding: 2
    }));
    spriteData.img.pipe(gulp.dest('app/img/'));
    spriteData.css.pipe(gulp.dest('app/sass/'));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(['!app/sass/libs.sass', '!app/sass/media.sass', 'app/sass/**/*.sass'])
    		.pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(concat('main.min.css'))
        // .pipe(cleanCSS())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass-libs', function() {
    return gulp.src("app/sass/libs.sass")
    		.pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(concat('libs.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass-media', function() {
    return gulp.src("app/sass/media.sass")
    		.pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(concat('media.css'))
        // .pipe(cleanCSS())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js'

		// 'app/js/common.min.js', // Всегда в конце
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.stream());
});

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img')); 
});



gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/libs.css',
		'app/css/main.min.css',
		'app/css/media.css'
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		'app/js/common.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});


gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['serve']);