var ClockworkLies = {
	mirrorName: "Clockwork Lies",
	canListFullMangas: false,
	mirrorIcon: "img/clockworklies.png",
	languages: "en",
  isMe: function (url) {
		return false;
	},
getMangaList: function (search, callback) {
	},
  getListChaps: function (urlManga, mangaName, obj, callback) {
	},
	getInformationsFromCurrentPage: function (doc, curUrl, callback) {
	},
	getListImages: function (doc, curUrl) {
	},
	removeBanners: function (doc, curUrl) {
	},
	whereDoIWriteScans: function (doc, curUrl) {
	},
	whereDoIWriteNavigation: function (doc, curUrl) {
	},
	isCurrentPageAChapterPage: function (doc, curUrl) {
	},
	doSomethingBeforeWritingScans: function (doc, curUrl) {
	},
	nextChapterUrl: function (select, doc, curUrl) {
		return null;
	},
	previousChapterUrl: function (select, doc, curUrl) {
		return null;
	},
	getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
	},
	isImageInOneCol: function (img, doc, curUrl) {
		return false;
	},
	getMangaSelectFromPage: function (doc, curUrl) {
		return null;
	},
	doAfterMangaLoaded: function (doc, curUrl) {
	}
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Clockwork Lies", ClockworkLies);
}