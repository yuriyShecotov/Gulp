/*папка с компилированная*/
let project_folder = require("path").basename(__dirname);
/*папка с исходникоми*/
let source_folder = "0src";

let fs = require('fs');
/**/
let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
	},
	src: {
		html: [source_folder + "/*.html" , "!" + source_folder + "/_*.html"],
		css: source_folder + "/sass/style.sass",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
	},
	watch:{
		html: source_folder + "/**/*.html",
		css: source_folder + "/sass/**/*.sass",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp');
let	gulp = require('gulp');
let	browsersync = require("browser-sync").create();  /*синхронизация c брайзером*/
let	fileinclude = require("gulp-file-include");      /*сборка подключёных файлов в html*/
let	del = require("del");                    /*обновления файла html в скомпелировоном файли*/
let	sass = require("gulp-sass");             /*обновления файла sass в скомпелировоном файли css*/
let	autoprefixer = require("gulp-autoprefixer"); /*автопрефикс в css*/
let	group_media = require("gulp-group-css-media-queries"); /*обеденяет медиа запросы в один css*/
let	clean_css = require("gulp-clean-css"); /*жимает готовый css*/
let	rename = require("gulp-rename"); /*переименовывает файлы*/
let	uglify = require("gulp-uglify-es").default; /*оптимизация js*/
let	imagemin = require('gulp-imagemin'); /*оптимизация ing*/
let	webp = require('gulp-webp'); /*создоём формат изоброжений webp*/
let	webphtml = require('gulp-webp-html'); /*подключаем к html webp*/
let	webpcss = require('gulp-webpcss'); /*подключаем к css webp*/
let	ttf2woff = require('gulp-ttf2woff'); /*подключаем к css webp*/
let	ttf2woff2 = require('gulp-ttf2woff2'); /*подключаем к css webp*/


/*Функции*/
	/*сервер*/
	function browerSync(params) {
		browsersync.init({
			server:{
				baseDir: "./" + project_folder + "/"
			},
			port: 3000,
			notify: false /*браузер обновился табличка*/
		})
	}
	/*создания попки проекта и компиляция в него*/
	function html(){
		return src(path.src.html)        /*считываем из файла*/
			.pipe(fileinclude())          /*компилируем собираем в один html*/
			.pipe(webphtml())
			.pipe(dest(path.build.html))  /*пашем в папку проекта*/
			.pipe(browsersync.stream())   /*синхронизируем с браузером*/
	}
	/*оброботка sass*/
	function css() {
		return src(path.src.css)        /*считываем из файла исходника*/
			/*обробатываем sass*/
			.pipe(
				sass({
					outputStyle: "expanded"
				})
			)
			/*груперуем медиа запросы*/
			.pipe(
				group_media()
			)
			.pipe(
				autoprefixer({
					overrideBrowserslist: ["last 5 version"],
					cascade: true
				})
			)
			.pipe(webpcss())
			.pipe(dest(path.build.css))  /*пашем в папку проекта .css не жатый*/
			.pipe(clean_css())          /*чистем и минимезируем css*/
			/*переименовываем в .min.css*/
			.pipe(
				rename({
					extname: ".min.css"
				})
			)
			.pipe(dest(path.build.css))  /*пашем в папку проекта сжатывй css*/
			.pipe(browsersync.stream())   /*синхронизируем с браузером*/
	}
	function js(){
		return src(path.src.js)        /*считываем из файла*/
			.pipe(fileinclude())          /*компилируем собираем в один js*/
			.pipe(dest(path.build.js))  /*пашем в папку проекта*/
			.pipe(uglify()) /*сжимаем*/
			.pipe(
				rename({extname: ".min.js"}) /*периименовываем*/
			)
			.pipe(dest(path.build.js))  /*пашем в папку проекта*/
			.pipe(browsersync.stream())   /*синхронизируем с браузером*/
	}

	function images(){
		return src(path.src.img)        /*считываем из файла*/
		.pipe(webp({
			quality: 70
		}))
		.pipe(dest(path.build.img))  /*пашем в папку проекта*/
		.pipe( src(path.src.img))
		.pipe(imagemin({
			progressiv: true,
			svgoPlugins: [{ removeViewBox: false}],
			interlaced: true,
			optimizationLevel: 3 //0 to 7
		}))
			.pipe(dest(path.build.img))  /*пашем в папку проекта*/
			.pipe(browsersync.stream())   /*синхронизируем с браузером*/
	}

	function fonts(params) {
		src(path.src.fonts)
			.pipe(ttf2woff())
			.pipe(dest(path.build.fonts))
		return src(path.src.fonts)
			.pipe(ttf2woff2())
			.pipe(dest(path.build.fonts))
	}
	function fontsStyle(params) {
		let file_content = fs.readFileSync(source_folder + '/sass/fonts.sass');
		if (file_content == '') {
				fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
				return fs.readdir(path.build.fonts, function (err, items) {
					if (items) {
						let c_fontname;
						for (var i = 0; i < items.length; i++) {
							let fontname = items[i].split('.');
							fontname = fontname[0];
							if (c_fontname != fontname) {
								fs.appendFile(source_folder + '/sass/fonts.sass', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
							}
							c_fontname = fontname;
						}
					}
				})
			}
	}
	function cb() {
		// body...
	}
	/*отслещивание изменений в html и синхронизация с браузером */
	function watchFiles(params) {
		gulp.watch([path.watch.html], html);
		gulp.watch([path.watch.css], css);
		gulp.watch([path.watch.js], js);
		gulp.watch([path.watch.img], images);
	}
	/*обновленя html проекта*/
	function clean(params){
		return del(path.clean);
	}

/*Запуск плагинов*/
let build = gulp.series(clean,gulp.parallel(js,css,html,images,fonts),fontsStyle);
let watch =   gulp.parallel(build,watchFiles,browerSync); /*подключения плагинов и функций*/


exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;