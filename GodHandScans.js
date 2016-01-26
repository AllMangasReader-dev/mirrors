var GodHandScans =
{
	mirrorName: "God Hand Scans",
	canListFullMangas: true,
	mirrorIcon: "img/godhandscans.png",
	languages: "pt",
	//Return true if the url corresponds to the mirror
	isMe: function(url)
	{
		return (url.indexOf("godhandscans.com.br/manga/") != -1);
	},
	//Return the list of all or part of all mangas from the mirror
	//The search parameter is filled if canListFullMangas is false
	//This list must be an Array of [["manga name", "url"], ...]
	//This function must call callback("Mirror name", [returned list]);
	getMangaList: function(search, callback)
	{
		$.ajax(
		{
			url: "http://godhandscans.com.br/directory/",
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
				$('tr:has(td.chapter) td.series a', div).each(function(index)
				{
					res.push([$(this).text(), $(this).attr('href')]);
				});
				callback("God Hand Scans", res);
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
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$('td.series a', div).each(function(index)
				{
					res.push([$(this).text(), $(this).attr('href')]);
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
		var name = $('h2', doc).text();
		var currentChapter = $('select.viewerChapter:first option:selected', doc).text();
		var currentMangaURL = $('h2 a', doc).attr('href');
		var currentChapterURL = currentMangaURL + $('select.viewerChapter:first option:selected', doc).attr('value') + '/';
		callback(
		{
			"name": name,
			"currentChapter": currentChapter,
			"currentMangaURL": currentMangaURL,
			"currentChapterURL": currentChapterURL
		});
	},
	//Returns the list of the urls of the images of the full chapter
	//This function can return urls which are not the source of the
	//images. The src of the image is set by the getImageFromPageAndWrite() function.
	getListImages: function(doc, curUrl)
	{
		var currentMangaURL = $('h2 a', doc).attr('href');
		var currentChapterURL = currentMangaURL + $('select.viewerChapter:first option:selected', doc).attr('value') + '/';
		var res = [];
		$('select.viewerPage:first option', doc).each(function()
		{
			res.push(currentChapterURL + $(this).attr('value') + '/');
		});
		return res;
	},
	//Remove the banners from the current page
	//This function runs in the DOM of the current consulted page.
	removeBanners: function(doc, curUrl)
	{
		$("iframe", doc).remove();
	},
	//This method returns the place to write the full chapter in the document
	//The returned element will be totally emptied.
	whereDoIWriteScans: function(doc, curUrl)
	{
		return $('.imgAMR', doc);
	},
	//This method returns places to write the navigation bar in the document
	//The returned elements won't be emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteNavigation: function(doc, curUrl)
	{
		return $(".navAMR", doc);
	},
	//Return true if the current page is a page containing scan.
	isCurrentPageAChapterPage: function(doc, curUrl)
	{
		if ($('#imageWrapper', doc))
		{
			return true;
		}
		return false;
	},
	//This method is called before displaying full chapters in the page
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		doc.onkeyup = null;
		$(doc.body).css('background-color', '#f4f4f4');
		$("#content table", doc).remove();
		$("#content", doc).append($("<div class='navAMR'></div>"));
		$("#content", doc).append($("<div class='imgAMR'></div>"));
		$("#content", doc).append($("<div class='navAMR'></div>"));
	},
	//This method is called to fill the next button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	nextChapterUrl: function(select, doc, curUrl)
	{
		if ($(select).children("option:selected").prev().size() != 0)
		{
			return $(select).children("option:selected").prev().val();
		}
		return null;
	},
	//This method is called to fill the previous button's url in the manga site navigation bar
	//The select containing the mangas list next to the button is passed in argument
	//This function runs in the DOM of the current consulted page.
	previousChapterUrl: function(select, doc, curUrl)
	{
		if ($(select).children("option:selected").next().size() != 0)
		{
			return $(select).children("option:selected").next().val();
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
			url: urlImg,
			success: function(objResponse)
			{
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var src = $('#imageWrapper img', div).attr('src');
				$(image).attr("src", src);
			}
		});
	},
	//If it is possible to know if an image is a credit page or something which
	//must not be displayed as a book, just return true and the image will stand alone
	//img is the DOM object of the image
	//This function runs in the DOM of the current consulted page.
	isImageInOneCol : function(img, doc, curUrl)
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
	registerMangaObject("God Hand Scans", GodHandScans);
}