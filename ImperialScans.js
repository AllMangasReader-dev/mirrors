var ImperialScans =
{
	// Name of the mirror
	mirrorName: "Imperial Scans",
	// True if the mirror can list all of its mangas.
	canListFullMangas: true,
	// Extension internal link to the icon of the mirror. (if not filled, will be blank...)
	mirrorIcon: "img/imperial.png",
	languages: "en",
	//Return true if the url corresponds to the mirror
	isMe: function(url)
	{
		return (url.indexOf("imperialscans.com") != -1);
	},
	//Return the list of all or part of all mangas from the mirror
	//The search parameter is filled if canListFullMangas is false
	//This list must be an Array of [["manga name", "url"], ...]
	//This function must call callback("Mirror name", [returned list]);
	getMangaList: function(search, callback)
	{
		$.ajax(
		{
			url: "http://imperialscans.com/archive",
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$('#chapters-list .manga-entry', div).each(function()
				{
					res.push([$('h2', $(this)).text(), 'http://imperialscans.com' + $('li:first a', $(this)).attr('href').match(/^\/read\/[^/]*/g)[0]]);
				});
				callback("Imperial Scans", res);
			}
		});
	},
	//Find the list of all chapters of the manga represented by the urlManga parameter
	//This list must be an Array of [["chapter name", "url"], ...]
	//This list must be sorted descending. The first element must be the most recent.
	//This function MUST call callback([list of chapters], obj);
	getListChaps: function(urlManga, mangaName, obj, callback)
	{
		$.ajax(
		{
			url: urlManga,
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				var div = document.createElement( "div" );
				div.innerHTML = objResponse;
				var res = [];
				$('#chapter-select option', div).each(function()
				{
					if ($(this).attr('value') == '') return true;
					res.push([$(this).text(), 'http://imperialscans.com' + $(this).attr('value')]);
				});
				callback(res, obj);
			}
		});
	},
	//This method must return (throught callback method) an object like :
	//{"name" : Name of current manga,
	//  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
	//  "currentMangaURL": Url to access current manga,
	//  "currentChapterURL": Url to access current chapter}
	//This function runs in the DOM of the current consulted page.
	getInformationsFromCurrentPage: function(doc, curUrl, callback)
	{
		var hlogospan = $('#hlogo span', doc).text();
		var name = hlogospan.substr(1, hlogospan.lastIndexOf(' ') - 1);
		var currentChapter = hlogospan.substr(hlogospan.lastIndexOf(' ') + 1);
		var currentMangaURL = 'http://imperialscans.com' + $('#series-select option:contains('+name+')', doc).attr('value');
		var currentChapterURL = 'http://imperialscans.com' + $('#chapter-select option:contains('+currentChapter+')', doc).attr('value');
		callback(
		{
			"name": name,
			"currentChapter": currentChapter,
			"currentMangaURL": currentMangaURL,
			"currentChapterURL": currentChapterURL}
		);
	},
	//Returns the list of the urls of the images of the full chapter
	//This function can return urls which are not the source of the
	//images. The src of the image is set by the getImageFromPageAndWrite() function.
	getListImages: function(doc, curUrl)
	{
		var res = [];
		$('#page-select option', doc).each(function()
		{
			if ($(this).attr('value') == '') return true;
			res.push($(this).attr('value'));
		});
		return res;
	},
	//Remove the banners from the current page
	//This function runs in the DOM of the current consulted page.
	removeBanners: function(doc, curUrl)
	{
		$('#leaderboard', doc).remove();
		$('#side-ad', doc).remove();
		$('#p180-root', doc).remove();
	},
	//This method returns the place to write the full chapter in the document
	//The returned element will be totally emptied.
	whereDoIWriteScans: function(doc, curUrl)
	{
		return $('#container .pageAMR', doc);
	},
	//This method returns places to write the navigation bar in the document
	//The returned elements won't be emptied.
	//This function runs in the DOM of the current consulted page.
	//you can change the DOM of the page before this method is called in doSomethingBeforeWritingScans
	whereDoIWriteNavigation: function(doc, curUrl)
	{
		return $(".navAMR", doc);
	},
	//Return true if the current page is a page containing scan.
	isCurrentPageAChapterPage: function(doc, curUrl)
	{
		return (curUrl.search('imperialscans.com/read/') > -1);
	},
	//This method is called before displaying full chapters in the page
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		if (typeof doc.createElement == 'function')
		{
			script = doc.createElement('script');
			script.innerText = "$(document).unbind('keydown');";
			doc.body.appendChild(script);
		}
		$("#container .page", doc).before($("<div class='navAMR'></div>"));
		$("#container .page", doc).after($("<div class='navAMR'></div>"));
		$("#container .page", doc).empty();
		$("#container .page", doc).css("width", "100%");
		$("#container .page", doc).css("text-align", "center");
		$("#container .page", doc).attr('class', 'pageAMR');
		$('#chapter-select', doc).hide();
		$('#page-select', doc).hide();
		$('#prevPage', doc).remove();
		$('#nextPage', doc).remove();
		$(".navAMR", doc).css("text-align", "center");
	},
	//This method is called to fill the next button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	nextChapterUrl: function(select, doc, curUrl)
	{
		var hlogospan = $('#hlogo span', doc).text();
		var currentChapter = hlogospan.substr(hlogospan.lastIndexOf(' ') + 1);
		if ($('#chapter-select option:contains('+currentChapter+')', doc).prev().attr('value'))
		{
			return 'http://imperialscans.com' + $('#chapter-select option:contains('+currentChapter+')', doc).prev().attr('value');
		}
		return null;
	},
	//This method is called to fill the previous button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	previousChapterUrl: function(select, doc, curUrl)
	{
		var hlogospan = $('#hlogo span', doc).text();
		var currentChapter = hlogospan.substr(hlogospan.lastIndexOf(' ') + 1);
		if ($('#chapter-select option:contains('+currentChapter+')', doc).next().attr('value'))
		{
			return 'http://imperialscans.com' + $('#chapter-select option:contains('+currentChapter+')', doc).next().attr('value');
		}
		return null;
	},
	//Write the image from the the url returned by the getListImages() function.
	//The function getListImages can return an url which is not the source of the
	//image. The src of the image is set by this function.
	//If getListImages function returns the src of the image, just do $( image ).attr( "src", urlImg );
	//This function runs in the DOM of the current consulted page.
	getImageFromPageAndWrite: function(urlImg, image, doc, curUrl)
	{
		$.ajax(
		{
			url: 'http://imperialscans.com' + urlImg,
			success: function(objResponse)
			{
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var src = 'http://imperialscans.com' + $('#page-img', div).attr('src');
				$(image).attr("src", src);
			}
		});
	},
	//If it is possible to know if an image is a credit page or something which
	//must not be displayed as a book, just return true and the image will stand alone
	//img is the DOM object of the image
	//This function runs in the DOM of the current consulted page.
	isImageInOneCol: function(img, doc, curUrl)
	{
		return false;
	},
	//This function can return a preexisting select from the page to fill the
	//chapter select of the navigation bar. It avoids to load the chapters
	//This function runs in the DOM of the current consulted page.
	getMangaSelectFromPage: function(doc, curUrl)
	{
		return null;
	},
	//This function is called when the manga is full loaded. Just do what you want here...
	//This function runs in the DOM of the current consulted page.
	doAfterMangaLoaded: function(doc, curUrl)
	{
		$("body > div:empty", doc).remove();
	}
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Imperial Scans", ImperialScans);
}