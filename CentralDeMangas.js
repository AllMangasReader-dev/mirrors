var CentralDeMangas =
{
	mirrorName: "Central De Mangas",
	canListFullMangas: true,
	mirrorIcon: "img/centraldemangas.png",
	languages: "pt",
	isMe: function(url)
	{
		return (url.indexOf("centraldemangas.com.br/") != -1);
	},
	//Return the list of all or part of all mangas from the mirror
	//The search parameter is filled if canListFullMangas is false
	//This list must be an Array of [["manga name", "url"], ...]
	//This function must call callback("Mirror name", [returned list]);
	getMangaList: function(search, callback)
	{
		$.ajax(
		{
			url: "http://centraldemangas.com.br/mangas",
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
				$("#conteudo table.tbl_mangas tbody tr td:first-child a", div).each(function(index)
				{
					res[res.length] = [$(this).text(), $(this).attr("href")];
				});
				callback("Central De Mangas", res);
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
			success: function( objResponse )
			{
				var div = document.createElement("div");
				div.innerHTML = objResponse;
				var res = [];
				$("div a", $("#conteudo .bloco:last-child", div)).each(function(index)
				{
					res[res.length] = [$(this).text(), $(this).attr("href") + '#1'];
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
		var name;
		var currentChapter;
		var currentMangaURL;
		var currentChapterURL;
		var pos;
		name = $("label[for='capitulos']", doc).text();
		pos = name.indexOf(":");
		name = name.substring(pos + 1, name.length).trim();
		currentChapter = $("#capitulos option:selected", doc).text();
		currentChapterURL = $("#capitulos option:selected", doc).val() + '#1';
		pos = currentChapterURL.lastIndexOf("/");
		currentMangaURL = currentChapterURL.substr(0, pos);
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
		var res;
		$("script", doc).each(function(index)
		{
			if ($(this).text().indexOf("var pags = ") != -1)
			{
				var posdeb = $(this).text().indexOf("var pags = ");
				var posfin = $(this).text().indexOf("]", posdeb);
				res = eval($(this).text().substring(posdeb + 11, posfin + 1));
			}
		});
		return res;
	},
	//Remove the banners from the current page
	//This function runs in the DOM of the current consulted page.
	removeBanners: function(doc, curUrl)
	{
		$("#anuncio_a").remove();
		$("#anuncio_b").remove();
	},
	//This method returns the place to write the full chapter in the document
	//The returned element will be totally emptied.
	//This function runs in the DOM of the current consulted page.
	whereDoIWriteScans: function(doc, curUrl)
	{
		return $(".pagina", doc);
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
		return ($("#img_pag", doc).size() > 0);
	},
	//This method is called before displaying full chapters in the page
	//This function runs in the DOM of the current consulted page.
	doSomethingBeforeWritingScans: function(doc, curUrl)
	{
		$("label[for='capitulos']", doc).remove();
		$("select[name='capitulos']", doc).remove();
		$("select[name='paginas']", doc).remove();
		$("ul.seletores", doc).remove();
		$("iframe", doc).remove();
		$(".pagina", doc).empty();
		$(".pagina", doc).css("background-color", "black");
		$(".pagina", doc).css("padding-top", "10px");
		$(".pagina", doc).before($("<div class='navAMR'></div>"));
		$(".pagina", doc).after($("<div class='navAMR'></div>"));
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
	//This function runs in the DOM of the current consulted page.
	getImageFromPageAndWrite: function(urlImg, image, doc, curUrl)
	{
		$(image).attr( "src", urlImg )
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
		return null;//$("#capitulos", doc);
	},
	//This function is called when the manga is full loaded. Just do what you want here...
	//This function runs in the DOM of the current consulted page.
	doAfterMangaLoaded: function(doc, curUrl)
	{
		if (typeof doc.createElement == 'function')
		{
			script = doc.createElement('script');
			script.innerText = "document.styleSheets[0].cssRules[0].selectorText = document.styleSheets[0].cssRules[0].selectorText";
			doc.body.appendChild(script);
		}
		$("body > div:empty", doc).remove();
	}
}
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
	registerMangaObject("Central De Mangas", CentralDeMangas);
}