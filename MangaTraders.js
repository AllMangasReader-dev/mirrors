var MangaTraders =
{
	mirrorName: "Manga Traders",
	canListFullMangas: false,
	mirrorIcon: "img/mangatraders.png",
	languages: "en",
	//Return true if the url corresponds to the mirror
	isMe: function(url)
	{
		return (url.indexOf("www.mangatraders.com/") != -1);
	},
	//Return the list of all or part of all mangas from the mirror
	//The search parameter is filled if canListFullMangas is false
	//This list must be an Array of [["manga name", "url"], ...]
	//This function must call callback("Mirror name", [returned list]);
	getMangaList: function(search, callback)
	{
		$.ajax(
		{
			url: "http://www.mangatraders.com/search/?searchSeries=1&showOnlySeries=1&term=" + search,
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(objResponse)
			{
				//var div = document.createElement("div");
				//div.innerHTML = objResponse;
				var res = [];
				$(".list1 li:not(:has(img[alt='NO_DL!'])) a", objResponse).each(function(index)
				{
					res.push([$(this).text(), "http://www.mangatraders.com" + $(this).attr("href")]);
				});
				callback("Manga Traders", res);
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
			url: urlManga + '/files',
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("Cache-Control", "no-cache");
				xhr.setRequestHeader("Pragma", "no-cache");
			},
			success: function(xml)
			{
				var res = [];
				$('file', xml).each(function(index)
				{
					res.push([$('file_disp', this).text(), "http://www.mangatraders.com/view/list/" + $(this).attr('id')]);
				});
				res.reverse();
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
		if (curUrl.indexOf('/list/') != -1)
		{
			var name = $('h2.viewListHeader a', doc).text();
			var currentChapter = $('#dropdown_top select[name=file_selector] option:selected', doc).text()
			var currentMangaURL = "http://www.mangatraders.com" + $('h2.viewListHeader a', doc).attr('href');
			var currentChapterURL = "http://www.mangatraders.com/view/list/" + $('#dropdown_top select[name=file_selector] option:selected', doc).attr('value');
		}
		else
		{
			var name = $($('#viewerHeader a')[0]).text();
			var currentChapter = doc.title.substring(24, doc.title.lastIndexOf('-') - 1);
			var currentMangaURL = "http://www.mangatraders.com" + $($('#viewerHeader a')[0]).attr('href');
			var currentChapterURL = curUrl.substring(0, curUrl.lastIndexOf('/page')==-1?curUrl.lenght:curUrl.lastIndexOf('/page')).replace('file', 'list');
		}
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
	//This function runs in the DOM of the current consulted page.
	getListImages: function(doc, curUrl)
	{
		var res = [];
		if (curUrl.indexOf('/list/') != -1)
		{
			$('#content_table a', doc).each(function(index)
			{
				res.push("http://www.mangatraders.com" + $(this).attr('href'));
			});
		}
		else
		{
			var baseUrl = curUrl.substring(0, curUrl.lastIndexOf('/page')==-1?curUrl.lenght:curUrl.lastIndexOf('/page')) + '/page/';
			$('select[name=page_top2] option', doc).each(function(index)
			{
				res.push(baseUrl + $(this).attr('value'));
			});
		}
		return res;
	},
	//Remove the banners from the current page
	//This function runs in the DOM of the current consulted page.
	removeBanners: function(doc, curUrl)
	{
		$('#topmenu ~ *', doc).remove();
		$('#header', doc).append('<br style="clear:both" />');
		$('#header', doc).css('height', 'auto');
		$('#google_ad_top', doc).remove();
		$('object', doc).remove();
	},
	//This method returns the place to write the full chapter in the document
	//The returned element will be totally emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteScans: function(doc, curUrl)
	{
		return $(".scanAMR", doc);
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
		return (curUrl.match(/www.mangatraders.com\/view\/(list|file)/gi) != null)
	},
	//This method is called before displaying full chapters in the page
	//This function runs in the DOM of the current consulted page.
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		if (typeof doc.createElement == 'function')
		{
			script = doc.createElement('script');
			script.innerText  = "function setAreaHeight() {return true;}";
			script.innerText += "var docCss = document.styleSheets; var cssOk = false;";
			script.innerText += "for (i = 0; i < docCss.length; i++)	if (docCss[i].cssRules){";
			script.innerText += "for (j = 0; j < docCss[i].cssRules.length; j++)	if (docCss[i].cssRules[j].selectorText == 'body, th, td, input, textarea, select, caption'){";
			script.innerText += "docCss[i].cssRules[j].style.color = '#565051'; cssOk = true; break;}";
			script.innerText += "if (cssOk) break;}";
			doc.body.appendChild(script);
		}
		$('body', doc).css('height', 'auto');
		$('#col1, #col3', doc).remove();
		$('#col2', doc).css('margin', '0 22px');
		$('#content', doc).empty();
		$('#content', doc).css('background', 'black');
		$('#content', doc).css('margin', '0');
		$('#content', doc).css('width', '100%');
		$('#content', doc).attr('class', '');
		$('#footer', doc).after($('#content', doc));
		$("<div class='navAMR'></div>").appendTo($("#content", doc));
		$("<div class='scanAMR'></div>").appendTo($("#content", doc));
		$("<div class='navAMR'></div>").appendTo($("#content", doc));
		$(".navAMR", doc).css("text-align", "center");
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
	getImageFromPageAndWrite: function(urlImg, image, doc, curUrl)
	{
		$.ajax(
		{
			url: urlImg,
			success: function(objResponse)
			{
				//var div = document.createElement("div");
				//div.innerHTML = objResponse;
				$(image).attr('src', $('#image', objResponse).attr('src'));
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
	getMangaSelectFromPage: function(doc, curUrl)
	{
		return null;
	},
	//This function is called when the manga is full loaded. Just do what you want here...
	//This function runs in the DOM of the current consulted page.
	doAfterMangaLoaded : function(doc, curUrl)
	{
		$("body > div:empty", doc).remove();
	}
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Manga Traders", MangaTraders);
}