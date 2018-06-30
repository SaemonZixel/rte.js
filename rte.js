// rte - rich text editor
// version: 0.5.1
// Author: Saemon Zixel, 2012-2018, http://saemonzixel.ru/
// Public Domain. Do with it all you want.

function rte(id, content) {

	// Undefined: пропустим
	if(typeof id == 'undefined') return;
	
	// DOMNode: заменим элемент на редактор
	if(id.nodeType) {
		if(!id.id) id.id = id.name || 'temp_'+(new Date())*1;
		var rte_conf = arguments.length > 2 ? arguments[2] : {};
		rte_conf.width = id.offsetWidth+'px';
		rte_conf.height = id.offsetHeight+'px';
		var rte_editor = document.createElement('DIV');
		rte_editor.innerHTML = rte(id.id, id.value || id.innerHTML, rte_conf);
		id.style.display = 'none';
		return id.parentNode.insertBefore(rte_editor.firstChild, id.nextSibling);
	}
	
	// ID: сгенерируем html-код редактора и вернём его
	if(typeof id == 'string') {
		var rte_id = 'rte_for_'+id;
	
		// примем настройки, если есть
		var conf = rte.default_config || {};
		if(arguments.length > 2) 
		for(var f in arguments[2]) conf[f] = arguments[2][f];

		// создадим 2 оброботчика для загрузки изображений и файлов
		window[rte_id+'_fileUploaded'] = conf.upload_file_callback_func_constructor(rte_id, conf);
// 		delete conf.upload_image_callback_func_constructor; delete conf.upload_file_callback_func_constructor;
		
		// CSS-стили редактора
		var rte_css = [
			'.rte_editor { position:relative }',
			'.rte_content { overflow-y:scroll; border:1px solid #ccc; outline:0; padding:3px; z-index: -1; }',
			'.rte_content iframe { background: rgba(0,0,0,0.9); position: relative !important; }',
			'.rte_panel { background-color:#EFEFEF;height:24px;border:1px solid #CCC;border-bottom:none;padding:0 1px;-moz-user-select:none; position: relative; z-index: 2 }',
			'.rte_panel-btn { width:18px;height:18px;display:inline-block;border:1px solid #efefef;margin:2px 1px;outline:0;background:url('+conf.toolbar_btn_png+') 0 0 }',
			'.rte_panel-btn:hover { border-color: #666 }',
			'.rte_panel-color_select { height:20px;width:9em;display:inline-block;vertical-align:top;border:1px solid silver;margin:2px 1px !important;outline:0;font-weight:bold;color:black;padding:1px 2px }',
			'.rte_panel2 { background:#EFEFEF; border:1px solid #CCC; display:none; position:absolute; bottom:0; left:0; min-width:'+conf.width+'; color:black; text-shadow: none; box-sizing: border-box; -moz-box-sizing: border-box; }',
			'.rte_panel2-row { margin:4px; font-size: 13px; }',
			'.rte_input { width:227px;border:1px solid #999;padding:1px 2px; }',
			'.rte_file { color: black; }',
			'.rte_panel2-rside { position:absolute;right:4px;bottom:4px; }',
			'.rte_panel2 button { padding:2px; margin-left: 0.5em; }',
			'.rte_panel2 iframe { height:0;width:0;visibility:hidden;position:absolute; }',
			'.rte_panel2 label { width: 115px; display: inline-block; }',
			'.rte_load_image label { width: 50px; }'
		];
		var style = document.getElementById('rte_css');
		if(!style) {
			style = document.createElement('style');
			style.type = 'text/css';
			if(style.styleSheet)
				style.styleSheet.cssText = rte_css.join('\n');
			else
				style.appendChild(document.createTextNode(rte_css.join('\n')));
			document.getElementsByTagName('head')[0].appendChild(style);
		}
		
		// начнём формировать html
		var rte_html = '<div id="'+rte_id+'" style="width:'+conf.width+';" class="rte_editor '+conf["class"]+'" oninput="return rte(event)" onclick="return rte(event)" data-conf="'+JSON.stringify(conf).replace(/"/g,'&quot;')+'"><div class="rte_panel" unselectable="on">';

		// наполняем панель инструментов
		var commands = window.rte_commands = {bold: '-54px', italic: '-126px', underline: '-342px', undo: '-486px', redo:'-504px', superscript: '-307px', justifyleft: '-162px', justifyright: '-234px', justifycenter: '-72px', insertorderedlist: '-180px', insertunorderedlist: '-324px', inserthorizontalrule: '-90px', createlink: '-378px', unlink: '-396px', insertimage: '-432px', h1: '-563px', h2: '-583px', h3: '-603px', h4: '-542px', clean: '-217px', html: '0px', insertfile: '-642px', youtube: '-642px', typograph: '-683px'};
		var toolbar = conf.toolbar.split(' ');
		var but_tmpl = '<a class="rte_panel-btn" href="javascript:void(0)" unselectable="on" style="background-position: 0 0"></a>'
		for(var i=0; i < toolbar.length; i++)
		switch(toolbar[i]) {
			case 'preview':
				rte_html += but_tmpl.replace(/background[^"]+">/, 'background:none;float:right;width:auto;text-decoration:none;color:gray;padding:0 2px" onclick="rte({type:\'contentpreview\',target:this})">Предпросмотр');
				break;
			case 'color':
				var colors = {'чёрный':'black','красный':'red','синий':'#3366ff','зелёный':'#008000','оранжевый':'#ff6600','серый':'#808080','коричневый':'#993300','коричневый':'#964B00','фиолетовый':'#53377A'};
				rte_html += '<select class="rte_panel-color_select nojs-select" onchange="return rte(event);">';
				for(var f in colors)
					rte_html += '<option style="font-weight:bold;color:'+colors[f]+';padding:1px 2px">'+f+'</option>';
				rte_html += '</select>';
				break;
			default: 
				if(toolbar[i] in commands)
					rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;"');
				break;
		}
		
		// поправим HTML в content предворительно
		var content_div = document.createElement('DIV');
		content_div.innerHTML = content;
		content = content_div.innerHTML;
		
		// Область редактирования
		rte_html += '</div><div class="rte_content" name="'+id+'" style="height:'+conf.height+'" contentEditable="true" onpaste="return rte(event)" onfocus="return rte();" onkeydown="return rte(event);" onkeyup="return rte(event);" onkeypress="return rte(event)" onclick="return rte(event)" ondblclick="return rte(event);">'+content+'</div>';
		
		// Панель загрузки изображения
		rte_html += '<div class="rte_panel2 rte_load_image">'+
		'<div class="rte_load_image-form">'+
		'<div class="rte_panel2-row"><label>Файл: </label><input class="rte_file" name="'+(conf.upload_image_input_file)+'" type="file" class="skip"></div>'+
		'<div class="rte_panel2-row"><label>URL: </label><input class="rte_input" type="text" value=""></div>'+
		'<div class="rte_panel2-rside"><button class="rte_load_image-submit_original" type="button">Вставить оригинал</button><button class="rte_load_image-submit" type="button">Вставить</button><button class="rte_load_image-cancel" type="button">Отменить</button></div>'+
		'</div></div>';

		// Панель загрузки файла
		rte_html += '<div class="rte_panel2 rte_load_file">'+
		'<div class="rte_load_file-form">'+
		'<div style="padding:4px">Файл: </span><input name="'+conf.upload_file_input_file+'" type="file" class="skip"></div>'+
		'<div style="padding:0 4px 4px">URL: <input type="text" value="" style="width:227px;border:1px solid #999;padding:1px 2px;"></div>'+
		'<div class="rte_panel2-rside"><button class="rte_load_file-submit" type="button">Вставить</button><button class="rte_load_file-cancel" type="button" style="padding:2px">Отменить</button></div>'+
		'</div></div>';
		
		// Панель редактирования чистого HTML
		rte_html += '<div class="rte_panel2 rte_raw_editor" style="width:99%;padding:2px;text-align:right"><textarea style="width:100%;height:'+(parseInt(conf.height)/2)+conf.height.replace(/^[0-9]*/,'')+'"></textarea><button type="button" class="rte_raw_editor-apply">применить</button><button type="button" class="rte_raw_editor-close">закрыть</button></div>';

		// Панель вставки произвольного HTML-кода
		rte_html += '<div class="rte_html_insert" style="background:#EFEFEF;border:1px solid #CCC;display:none;position:absolute;bottom:0;left:0;width:99%;padding:2px;text-align:right"><textarea style="width:100%;height:'+(parseInt(conf.height)/2)+conf.height.replace(/^[0-9]*/,'')+'"></textarea><button type="button" class="rte_html_insert-insert">вставить</button><button type="button" class="rte_html_insert-close">закрыть</button></div>';

		// Панель редактирования параметров изображения
		rte_html += '<div class="rte_panel2 rte_image_edit"><div class="rte_panel2-row"><label>Alt: </label><input class="rte_input"></div>'+
		'<div class="rte_panel2-rside"><button type="button" class="rte_image_edit-apply">Применить</button><button type="button" onclick="this.parentNode.parentNode.style.display=\'none\';return false">Закрыть</button></div>'+
		'<div class="rte_panel2-row"><label>Выравнивание: </label><select><option value="none">нет</option><option value="left">по левому краю</option><option value="right">по правому краю</option></select></div>'+
		'<div class="rte_panel2-row"><label>Размер, пикс: </label><input class="rte_input edit_img_width" style="width:3em;">&nbsp;&times;&nbsp;<input class="rte_input edit_img_height" style="width:3em;"></div></div>';
	
		// Панель редактирования/вставить ссылки
		rte_html += '<div class="rte_panel2 rte_link_add_edit"><div class="rte_panel2-row"><label>URL: </label><input class="rte_input" style="width:60%"></div>'+
		
		'<div class="rte_panel2-rside"><button type="button" class="rte_link_add_edit-apply">Изменить</button><button type="button" onclick="this.parentNode.parentNode.style.display=\'none\';return false">Закрыть</button></div>'+
		
		'<div class="rte_panel2-row"><label>Открыть в: </label><select><option value="_self">этом окне (_self)</option><option value="_blank">новом окне (_blank)</option><option value="_parent">родительском фрейме (_parent)</option><option value="_top">этом окне, без фреймов (_top)</option></select></div></div>';
		
		return rte_html+'</div>';
	}

	/* если это не Event, то дальше не надо идти ------------------------------------- */
	if(typeof id != 'object' || 'type' in (id||window.event) == false) return;
	
	var ev = id || window.event;
	var trg1 = ev.target || ev.srcElement || document.body.parentNode;
	if(trg1.nodeType && trg1.nodeType == 9) trg1 = trg1.body.parentNode; // #document
	if(trg1.nodeType && trg1.nodeType == 3) trg1 = trg1.parentNode; // #text

	// найдём rte_root и rte_content_area теги/узлы для удобства
	for(var rte_root = trg1;;rte_root = rte_root.parentNode) {
		if(rte_root.className.indexOf('rte_content') > -1) {
			var rte_content_area = rte_root, click_within_content_area = true;
			rte_root = rte_root.parentNode;
			break;
		} 
		else if(rte_root.className.indexOf('rte_editor') > -1) {
			var rte_content_area = rte_root.firstElementChild.nextElementSibling, click_within_content_area = false;
			break;
		}
		if(!rte_root.parentNode) {
			rte_root = document.querySelector('.rte_editor');
			var rte_content_area = rte_root ? rte_root.firstElementChild.nextElementSibling : {}, click_within_content_area = false;;
			break;
		}
	}
	
	// при каждом нажатии клавиши сохраняем позицию курсора
	if(ev.type == 'keypress' || (ev.type == 'click' && click_within_content_area)) {
		rte_content_area.rng = false;
		if(window.getSelection && window.getSelection().rangeCount > 0)
			rte_content_area.rng = window.getSelection().getRangeAt(0)
		else if(!window.getSelection)
			rte_content_area.rng = document.selection.createRange();
		
		if(ev.type == 'click' && 'undo_stack' in rte_content_area)
			(rte_content_area.undo_stack['save'+(rte_content_area.undo_stack.next-1)] || {}).append = false;
		
		return true;
	}
	
	// .rte_content - ctrl+z/ctrl+y
	if(ev.type == 'keydown') {
		var key = ev.keyCode ? ev.keyCode : (ev.which ? ev.which : null);
		
		// ctrl+z/ctrl+y
		var cancel_event = false;
		if (ev.ctrlKey || ev.metaKey)
		switch(key) {
			case 89: 
				rte({type:'click', target: {parentNode: rte_root, className: 'rte_panel-btn', style:{backgroundPosition: window.rte_commands['redo']+' 0px'}}});
				cancel_event = true;
				break;
			case 90: 
				if(ev.altKey || ev.shiftKey)
					rte({type:'click', target: {parentNode: rte_root, className: 'rte_panel-btn', style:{backgroundPosition: window.rte_commands['redo']+' 0px'}}});
				else
					rte({type:'click', target: {parentNode: rte_root, className: 'rte_panel-btn', style:{backgroundPosition: window.rte_commands['undo']+' 0px'}}});
				cancel_event = true;
				break;
			case 17:
				return true;
		}
			
		/*  if(window['console']) {
			console.log(ev);
			console.log(cancel_event);
		} */
		
		if(cancel_event) {
			ev.cancelBubble = true;
			ev.returnValue = false;
			if(ev.cancelable) {
				ev.preventDefault();
				ev.stopPropagation()
			}
			return false;
		}  
		
		// буквы... либо закрываем состояние
		if(key == 32 || key >= 45) {
			rte({type: 'undostackpush', target: rte_root, undo_mode: 'keypress-tracking'});
		} else {
			if('undo_stack' in rte_content_area)
				(rte_content_area.undo_stack['save'+(rte_content_area.undo_stack.next-1)] || {}).append = false;
		}
		
		return true;
	}
	
	// ,rte_content - [DELETE,BACKSPACE]
	if(ev.type == 'keyup') {
		var key = ev.keyCode ? ev.keyCode : (ev.which ? ev.which : null);
// console.log(key);
		if(key == 8 /* BACKSPACE */ || key == 46 /* DELETE */ ) {
			if(window.getSelection && window.getSelection().rangeCount > 0) { // W3C
				var rng = window.getSelection().getRangeAt(0)
				var node = rng.startContainer;
			}
			else if(!window.getSelection) { // IE
				var rng = document.selection.createRange();
				var node = rng.anchorNode;
			}
			
//console.log(node.nodeName);
			// уберём лишний родительский тег
			if(node.nodeName != '#text' 
			&& node.parentNode != rte_content_area && node != rte_content_area
			&& (!node.firstChild || node.innerHTML.toLowerCase() == '<br>')) {
				var parent = node.parentNode;
				while(node.firstChild) parent.appendChild(node.firstChild);
				parent.removeChild(node);
				node = parent;
				
				// возможно ещё один лишний родительский тег
				if(node.parentNode != rte_content_area 
				&& (!node.firstChild || node.innerHTML.toLowerCase() == '<br>')) {
					var parent = node.parentNode;
					while(node.firstChild) parent.appendChild(node.firstChild);
					parent.removeChild(node);
					node = parent;
				}
				
				// уберём излишнии атрибуты
				if(node.getAttribute('style')) node.removeAttribute('style');
				if(node.getAttribute('class')) node.removeAttribute('class');
				
				if(document.createRange) { // W3C
					rng = document.createRange();
					rng.selectNode(node);
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(rng);
					sel.collapseToStart();
				} 
				else { // IE
					var rng = document.body.createTextRange();
					rng.moveToElementText(node);
					rng.select();
					rng.collapse(true);
				}
			}

// console.log(rte_content_area.innerHTML);
		}
	}
	
	// .rte_content - styleWithCSS = false
	if(ev.type == 'focus') {
		setTimeout(function(){ 
			try{ 
				document.execCommand('styleWithCSS', false, false); 
			}catch(ex){
				/* skip */
			}; 
		}, 20);
		
		return true;
	}
	
	// .rte_content [dblclick]
	if(ev.type == 'dblclick' && trg1.nodeName == 'IMG') {

		for(var div = rte_root.firstElementChild; div; div = div.nextElementSibling){
			if(div.className.indexOf('rte_image_edit') > -1) {
				div.style.display = 'block'; 
				div.style.width = rte_root.clientWidth+'px' 
				
				var inputs = div.getElementsByTagName('input'); 
				inputs[0].value = trg1.getAttribute('alt') ? trg1.getAttribute('alt') : ''; 
// 				inputs[1].parentNode.setAttribute('data-aspect', trg1.clientWidth / trg1.clientHeight);
				inputs[1].value = trg1.clientWidth; 
				inputs[2].value = trg1.clientHeight; 
				div.getElementsByTagName('select')[0].selectedIndex = (
						trg1.getAttribute('align') ? 
						{none:0,left:1,right:2}[trg1.getAttribute('align')] 
						: 0); 
		
				div.selected_img = trg1; 
			}
			else if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		
		return false;
	}
	
	// .rte_content [paste]
	if(ev.type == 'paste') {
		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		var conf = JSON.parse(rte_root.getAttribute('data-conf'));
		var a = rte_content_area;
		setTimeout(function(){ 
			a.innerHTML = rte({type: 'striptags', target: a,
				html: a.innerHTML.replace(/<style[^>]*>[^<]*<\/style>/g, ''),
				allowed_tags: ev.onpaste_allow||conf.onpaste_allow, 
				allow_attr_in: ev.onpaste_allow_attr_in||conf.onpaste_allow_attr_in
			});
		}, 20);
		return true;
	}
	
	if(ev.type == 'upload') {
		
		// создадим вспомогательный IFRAME
		var hidden_upload_iframe = document.getElementById('rte_hidden_upload_iframe');
		if(!hidden_upload_iframe) {
			var hidden_upload_iframe = document.createElement('IFRAME');
			hidden_upload_iframe.style.display = "none";
			hidden_upload_iframe.name = 'rte_hidden_upload_iframe';
			hidden_upload_iframe.id = 'rte_hidden_upload_iframe';
			hidden_upload_iframe.src = 'javascript:void(0);';
			document.body.appendChild(hidden_upload_iframe);
		}
		
		// создадим вспомогательную форму загрузки файла
		var upload_form = document.createElement('FORM');
		upload_form.action = ev.form_action || document.location.href;
		upload_form.method = 'POST';
		upload_form.target = 'rte_hidden_upload_iframe';
		upload_form.encoding = 'multipart/form-data';
		upload_form.enctype = 'multipart/form-data';
		upload_form.style.display = 'none';
		document.body.appendChild(upload_form);
		
		// наполним полями с данными
		for(var f in ev) if(ev[f] && f.match(/^hidden_input[0-9]+$/) && ev[f].length) {
			upload_form.appendChild(document.createElement('INPUT'));
			upload_form.lastChild.name = ev[f][0];
			upload_form.lastChild.value = ev[f][1];
		}
		
		// перенесём на время поле с файлом
		var input_file_orig = ev.input_file;
		var input_file_clone = input_file_orig.cloneNode(true);
		input_file_orig.parentNode.replaceChild(input_file_clone, input_file_orig);
		upload_form.appendChild(input_file_orig);
		
		// отпровим
		upload_form.submit();
		
		// почистим за собой
		setTimeout(function(){
			input_file_clone.parentNode.replaceChild(input_file_orig, input_file_clone);
			document.body.removeChild(upload_form);
		}, 100);
		
		return;
	}
	
	if(ev.type == 'imageuploadresponse') {
		if(!ev.result) return alert(ev.message || 'Error!');

		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		// вставим html
		rte({type: 'inserthtml', target: rte_root, html: '<img src="'+(ev.img_src)+'" alt="'+(ev.img_alt||'').replace(/"/g, '&quot;')+'" class="'+(ev.img_class||'')+'">'});
		
		// скроем панель загрузки и отчистим вспомогательный фрейм
		document.getElementById('rte_hidden_upload_iframe').src = 'about:blank';
		for(var div = rte_root.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
			if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		
		return;
	}
	
	if(ev.type == 'fileuploadresponse') {
		if(!ev.result) return alert(ev.message || 'Error!');
		
		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		// вставим html
		rte({type: 'inserthtml', target: rte_root, html: '<a href="'+ev.a_href+'" class="'+(ev.a_class||'')+'" title="'+(ev.a_title||'')+'" '+(ev.a_target==''?'':'target="'+ev.a_target+'"')+'>'+(ev.a_innerHtml||'')+'</a>'});
		
		// скроем панель загрузки и отчистим вспомогательный фрейм
		document.getElementById('iframe_forupload').src = 'about:blank';
		for(var div = rte_root.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
			if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		return;
	}
	
	// undo_stack.push()
	if(ev.type == 'undostackpush') {

		// создадим стек если надо
		rte_content_area.undo_stack = rte_content_area.undo_stack || {next: 1};

		// если мы отслеживаем набор текста, то выходим, 
		// иначе надо отключить отслеживание текста в пред. сохранении
		var prev = rte_content_area.undo_stack['save'+(rte_content_area.undo_stack.next-1)];
		if(prev && prev.append) {
			if(ev.undo_mode == 'keypress-tracking') return;
			prev.append = false;
		} 

		// выделение, либо нам его передали, либо используем текущее
		var rng = ev.rng;
		if(!rng) {
			if(window.getSelection().rangeCount > 0)
				rng = window.getSelection().getRangeAt(0);
			else {
				rng = document.createRange();
				if(!rte_content_area.lastElementChild) rte_content_area.appendChild(document.createElement('BR'));
				rng.selectNode(rte_content_area.lastElementChild);
				window.getSelection().addRange(rng);
			}
		}
		
		// сформируем путь порядковых номеров тегов (childNodes[n1].childNodes[n2]...) 
		// из начала и конца выделения
		var start = [0, rng.startOffset]; // символ
		var node = rng.startContainer;
		for(var cnt = 100; !!node && cnt; cnt--) {
			if(node['contentEditable'] && node.getAttribute('contentEditable') == 'true')
				break;
			if(node.previousSibling) {
				start[0]++;
				node = node.previousSibling;
			} else {
				start.unshift(0);
				node = node.parentNode;
			}
		}

		var end = [0, rng.endOffset];
		node = rng.endContainer;
		for(var cnt = 100; !!node && cnt; cnt--) {
			if(node['contentEditable'] && node.getAttribute('contentEditable') == 'true')
				break;
			if(node.previousSibling) {
				end[0]++;
				node = node.previousSibling;
			} else {
				end.unshift(0);
				node = node.parentNode;
			}
		}    

		// если надо сохранить отдельно
		if(ev.undo_mode == 'save_undo_start') {
			rte_content_area.undo_stack['save_undo_start'] = {
				innerHTML: rte_content_area.innerHTML, 
				append: false, 
				selection: [rte_content_area.scrollTop||0, start, end]
			};
			return;
		} 
		
		// сохраним состояние    
		rte_content_area.undo_stack['save'+rte_content_area.undo_stack.next] = {
			innerHTML: rte_content_area.innerHTML, 
			append: ev.undo_mode=='keypress-tracking', 
			selection: [rte_content_area.scrollTop||0, start, end]
		};
		rte_content_area.undo_stack.next++;

		// почистим
		delete rte_content_area.undo_stack['save'+rte_content_area.undo_stack.next]; // если откатывались по redo
		delete rte_content_area.undo_stack['save_undo_start']; // это уже не актуально
		
		return;
	}
	
	// inserthtml()
	if(ev.type == 'inserthtml') {
		var rng = rte_content_area.rng;
		
		if(window.getSelection) {
			if(!rng) {
				rng = document.createRange();
				if(!rte_content_area.lastElementChild) 
					rte_content_area.appendChild(document.createElement('BR'));
				rng.selectNode(rte_content_area.lastElementChild);
				window.getSelection().addRange(rng);
			}
			
			var div = document.createElement('DIV');
			div.innerHTML = ev.html;
			
			if(rng.endContainer.nodeValue == null) {
				while(div.childNodes.length)
					rng.endContainer.insertBefore(div.firstChild, rng.endContainer.childNodes[rng.endOffset]||null);
			} else {
				var p = rng.endContainer.parentNode;
				var txt = document.createTextNode(rng.endContainer.nodeValue.substring(0, rng.endOffset));
				p.insertBefore(txt, rng.endContainer);
				while(div.childNodes.length)
					p.insertBefore(div.firstChild, rng.endContainer);
				rng.endContainer.nodeValue = rng.endContainer.nodeValue.substring(rng.endOffset);
			}
		} 
		// IE8 and older
		else {
			rng = document.selection.createRange();
			rng.pasteHTML(rng.htmlText + ev.html);
		}
		
		return;
	}
	
	//  replace_strike(a, tag)
	if(ev.type == 'replacestrike') {
		var parts = rte_content_area.innerHTML.split(/<st?r?i?k?e?>/i);
		for(var i=1; i < parts.length; i++) {
			var two = parts[i].split(/<\/st?r?i?k?e?>/i);
			if(two.length == 1) continue;
			if(ev.regex > 2) two[0] = two[0].replace(ev.regex, '');
			parts[i] = two[0] + '</'+ev.tag.replace(/^([^ ]+).*$/, '$1')+'>' + two[1];
		}  

		rte_content_area.innerHTML = parts.join('<' + ev.tag + '>');
	};
	
	// wrap_unwrap(a, tag) {
	if(ev.type == 'wrapunwrap') {
		var unwrap_mode = false;
		var parts = rte_content_area.innerHTML.split(/<st?r?i?k?e?>/i);
		for(var i=1; i < parts.length; i++) {
			var two = parts[i].split(/<\/st?r?i?k?e?>/i);
			if(two.length == 1) continue;
		
			if(parts[i-1].match(new RegExp('<'+ev.tag+'[^>]*>$', 'img'))) {
				parts[i-1] = parts[i-1].replace(new RegExp('<'+ev.tag+'[^>]*>$', 'img'), '');
				unwrap_mode = true;
			}
		
			if(two[1].match(new RegExp('^<'+ev.tag+'[^>]*>', 'img'))) {
				two[1] = two[1].replace(new RegExp('^<'+ev.tag+'[^>]*>', 'img'), '');
				unwrap_mode = true;
			}
		
			// если внутри есть указанные тег, то значит убираем его только
			if(two[0].match(new RegExp('<'+ev.tag, 'img'))) {
				two[0] = two[0].replace(new RegExp('<'+ev.tag+'[^>]*>', 'img'), '').replace(new RegExp('</'+ev.tag+'[^>]*>', 'img'), '');
				unwrap_mode = true;
			} 
		
			if(unwrap_mode == false)
				parts[i] = two[0] + '</'+ev.tag.replace(/^([^ ]+).*$/, '$1')+'>' + two[1];
		}  
	
		rte_content_area.innerHTML = parts.join( unwrap_mode ? '' : '<'+ev.tag+'>' ).replace('<'+ev.tag+'></'+ev.tag+'>', '');
	};
	
	// strip_tags(str, allowed_tags, allow_attr_in) {
	if(ev.type == 'striptags') {
		var tags = ev.allowed_tags.split(' ');
		var attrs = ' '+ev.allow_attr_in.toLowerCase()+' ';
		
		// разбираем текст на части и фильтруем
		var lines = ('<temp>'+ev.html).match(/(<\/?[\S][^>]*>[^<]*)/gi);
		var result = [];
		for(var i = 0; i < lines.length; i++) {
			
			// проверим, есть ли разрешённый тег в начале
			var pass = 0;
			for(var t = 0; t < tags.length; t++)
				if(lines[i].toLowerCase().indexOf('<'+tags[t]+'>') == 0 
				|| lines[i].toLowerCase().indexOf('</'+tags[t]) == 0) {
					pass = 1;
					break;
				} 
				else if(lines[i].toLowerCase().indexOf('<'+tags[t]+' ') == 0) {
					pass = 2; // потом надо будет почистить атрибуты
					break;
				} 
			
			// если прошёл проверку - пропускаем, иначе чистим
			switch(pass) {
				case 1:
					result.push(lines[i]); 
					break;
				case 2:
					if(attrs.indexOf(' '+tags[t].toLowerCase()+' ') < 0)
						result.push(lines[i].replace(/^<([a-zA-Z0-9]+)[^>]+>(.*)$/mg, '<$1>$2'));
					else
						result.push(lines[i].replace(/ ?style="[^"]+"/mg, '')); 
					break;
				default:
					if(lines[i].match(/^<(td|img)/))
						result.push(lines[i].replace(new RegExp('^<\/?[^>]*>'), ' '));
					else
						result.push(lines[i].replace(new RegExp('^<\/?[^>]*>'), ''));
			}
		}
		
		return result.join('');
	};
	
	if(ev.type == 'change' && trg1.className.indexOf('rte_panel-color_select') > -1) {
		var opt = trg1.options[trg1.selectedIndex];
		trg1.style.color = opt.style.color;
		
		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		// обернём выделенный кусочек текста в тег strike
		document.execCommand('strikethrough', false, false);
		
		// заменим на наш тег
		rte({type: 'replacestrike', target: rte_root, tag: 'span style="color:'+opt.style.color+'"', regex: new RegExp('color:[^;]+;?', 'i')});
		
		return;
	}

	// .rte_load_image-submit, .rte_load_image-submit_original
	if(ev.type == 'click' && trg1.className.indexOf('rte_load_image-submit') > -1) {
		var inps = trg1.parentNode.parentNode.getElementsByTagName('INPUT');
		
		// если указали URL изображения то вставим сразу в текст как <img>
		if(!inps[1].value.match(/^ *$/)) {
			rte({type: 'imageuploadresponse', 
				result: true, 
				target: trg1,
				img_src: inps[1].value
			}); 
			return;
		}
		
		/* иначе загружаем изображение на сервер */
		var conf = JSON.parse(rte_root.getAttribute('data-conf'));
		conf.upload_image_callback = rte_root.id+'_imageUploaded_'+(new Date())*1;
		
		// попросили вставить оригинал
		if(trg1.className.indexOf('rte_load_image-submit_original') > -1) {
			delete conf.upload_image_hidden3; delete conf.upload_image_hidden2;
			window[conf.upload_image_callback] = rte.default_config.upload_image_callback_func_constructor(rte_root.id, conf);
			return rte({type: 'upload',
				target: trg1,
				form_action: conf.upload_image_action,
				input_file: inps[0],
				hidden_input1: ["callback", conf.upload_image_callback],
				hidden_input2: conf.upload_image_hidden1
			});
		}
		
		// загружаем стандартно
		else {
			window[conf.upload_image_callback] = rte.default_config.upload_image_callback_func_constructor(rte_root.id, conf);
			return rte({type: 'upload',
				target: trg1,
				form_action: conf.upload_image_action,
				input_file: inps[0],
				hidden_input1: ["callback", conf.upload_image_callback],
				hidden_input2: conf.upload_image_hidden1,
				hidden_input3: conf.upload_image_hidden2,
				hidden_input4: conf.upload_image_hidden3
			});
		}
	}
	
	// .rte_load_file-submit
	if(ev.type == 'click' && trg1.className.indexOf('rte_load_file-form') > -1) {
		var inps = trg1.parentNode.parentNode.getElementsByTagName('INPUT');
		
		// если указали ссылку на файл, то вставим сразу в текст как <a>
		if(!inps[1].value.match(/^ *$/)) {
			rte({type: 'fileuploadresponse', 
				result: true, 
				target: trg1,
				a_href: inps[1].value,
				a_innerHtml: inps[1].value
			}); 
			return false;
		}
		
		// иначе загружаем изображение на сервер
		var conf = JSON.parse(rte_root.getAttribute('data-conf'));
		return rte({type: 'upload',
			target: trg1,
			input_file: inps[0],
			form_action: conf.upload_file_action,
			hidden_input1: ["callback", rte_root.id+'_fileUploaded'],
			hidden_input2: conf.upload_file_hidden1,
			hidden_input3: conf.upload_file_hidden2,
			hidden_input4: conf.upload_file_hidden3
		});
	}
	
	// rte_image_edit  .img_width/.img_height
	if(trg1.className.indexOf('edit_img_width') > -1 || trg1.className.indexOf('edit_img_height') > -1) {
		var img = trg1.parentNode.parentNode.selected_img;
		var orig_w = img['naturalWidth'] || img.offsetWidth;
		var orig_h = img['naturalHeight'] || img.offsetHeight;
		var val = parseInt(trg1.value||''); 
		if(isNaN(val)) val = 0;

		if(trg1.className.indexOf('edit_img_width') > -1) {
			var new_height = Math.round(val * (orig_h / orig_w));
			trg1.parentNode.getElementsByTagName('input')[1].value = new_height;
		} else {
			var new_width = Math.round(val * (orig_w / orig_h));
			trg1.parentNode.getElementsByTagName('input')[0].value = new_width;
		}
	}
	
	// .rte_html_insert-insert
	if(trg1.className.indexOf('rte_html_insert-insert') > -1) {
		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		// добавим html
		rte({type: 'inserthtml', target: trg.parentNode, html: trg1.previousSibling.value});
		
		// скроем панель
		for(var div = rte_root.firstElementChild; div.nextElementSibling; div = div.nextElementSibling)
			if(div.className.indexOf('rte_panel2') > -1) 
				div.style.display = 'none';
			
		return;
	}
	
	// .rte_raw_editor-apply
	if(trg1.className.indexOf('rte_raw_editor-apply') > -1) {
		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		// обновим содержимое
		rte_content_area.innerHTML = trg1.previousSibling.value;
		
		// скроем панель
/*			for(var div = rte_root.firstElementChild; div.nextElementSibling; div = div.nextElementSibling)
			if(div.className.indexOf('rte_panel2') > -1) 
				div.style.display = 'none';*/
			
		return;
	}
	
	// .rte_image_edit-apply
	if(trg1.className.indexOf('rte_image_edit-apply') > -1) {
		var panel = trg1.parentNode.parentNode;
		var img = panel.selected_img; 
		var inputs = panel.getElementsByTagName('input'); 
		img.setAttribute('alt', inputs[0].value); 
		img.setAttribute('width',inputs[1].value); 
		img.setAttribute('height',inputs[2].value); 
		img.setAttribute('align', ['','left','right'][panel.getElementsByTagName('select')[0].selectedIndex]);
		return;
	}
	
	// .rte_link_edit-apply
	if(trg1.className.indexOf('rte_link_add_edit-apply') > -1) {
		var panel = trg1.parentNode.parentNode;
		var inputs = panel.getElementsByTagName('input');
		var selects = panel.getElementsByTagName('select'); 
		var node = panel.selected_a; 
		if(node) {
			node.setAttribute('href', inputs[0].value); 
			if(selects[0].selectedIndex > 0)
				node.setAttribute('target', ['','_blank','_parent','_top'][selects[0].selectedIndex]);
			else
				node.removeAttribute('target');
		}
		else {
			var rng = panel.rng;
			var node = rng.startContainer || rng.anchorNode;
			var parent = node.parentNode;
			
			if(!window.getSelection) rng.select(); // IE
			else { // W3C
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(rng);
			} 
			
			// создадим ссылку со специальной отметкой в href
			rte({type: 'undostackpush', target: rte_root});
			document.execCommand('createlink', false, '#rte_new_link'); 

			// найдём нашу новую ссылку и заполним атрибуты правильно
			var links = rte_content_area.getElementsByTagName('A');
			for(var i = 0; i < links.length; i++) 
			if(links[i].href.indexOf('#rte_new_link') > -1) {
				node = links[i];
				node.setAttribute('href', inputs[0].value); 
				if(selects[0].selectedIndex > 0)
					node.setAttribute('target', ['','_blank','_parent','_top'][selects[0].selectedIndex]);
//console.log(rng);
			}
		}
		
		panel.style.display = 'none';
		return;
	}
	
	// cancel, close
	if(trg1.className.indexOf('rte_raw_editor-close') > -1
	|| trg1.className.indexOf('rte_load_file-cancel') > -1
	|| trg1.className.indexOf('rte_load_image-cancel') > -1
	|| trg1.className.indexOf('rte_html_insert-close') > -1
	) {
		for(var div = rte_root.firstElementChild; div.nextElementSibling; div = div.nextElementSibling)
			if(div.className.indexOf('rte_panel2') > -1) 
				div.style.display = 'none';
	}
	
	if(trg1.className.indexOf('rte_panel-btn') < 0) return;
	
	/* --------------------------- .rte_panel-btn --------------------------- */
	var rte_panel_btn_type = '(unknown)';
	var trg1_bg_posX = (trg1.style.backgroundPosition||'').substring(0, (trg1.style.backgroundPosition||'').indexOf(' '));
	for(var f in window.rte_commands)
		if(trg1_bg_posX == window.rte_commands[f]) {
			rte_panel_btn_type = f;
			break;
		}
	
	// .rte_panel-btn [h1,h2,h3,h4]
	if('h1 h2 h3 h4'.indexOf(rte_panel_btn_type) > -1) {
		// сохраним текущее состояние в стек измений
		rte({type: 'undostackpush', target: rte_root});
		
		document.execCommand('strikethrough', false, false);
		rte({type: 'wrapunwrap', target: rte_root, tag: rte_panel_btn_type});
		
		return;
	}
	
	// .rte_panel-btn [createlink]
	if(rte_panel_btn_type == 'createlink') {
		var sel = window.getSelection ? window.getSelection() : window.document.selection;
		var rng = window.getSelection ? sel.getRangeAt(0) : sel.createRange();
		var node = window.getSelection ? rng.startContainer : rng.anchorNode;
		while(node && node.nodeName != 'A' && node != rte_root) node = node.parentNode;
		if(node.nodeName != 'A') {
			var node = window.getSelection ? rng.endContainer : rng.focusNode;
			while(node && node.nodeName != 'A' && node != rte_root) node = node.parentNode;
		}
		
		for(var div = rte_root.firstElementChild; div; div = div.nextElementSibling){
			if(div.className.indexOf('rte_link_add_edit') > -1) {
				
				// покажем панель редактирования параметров если внутри ссылки
				if(node.nodeName == 'A') {
					
					// заполним форму
					div.getElementsByTagName('input')[0].value = node.href;
					switch(node.getAttribute('target')) {
						case '_blank': div.getElementsByTagName('select')[0].selectedIndex = 1; break;
						case '_parent': div.getElementsByTagName('select')[0].selectedIndex = 2; break;
						case '_top': div.getElementsByTagName('select')[0].selectedIndex = 3; break;
						default: div.getElementsByTagName('select')[0].selectedIndex = 0;
					}
					div.getElementsByTagName('button')[0].innerHTML = 'Изменить';
					
					// привяжем редактируемый элемент
					div.selected_a = node;
				}
				
				// покажем панель создания ссылки
				else {
					// заполним форму
					div.getElementsByTagName('input')[0].value = '';
					div.getElementsByTagName('select')[0].selectedIndex = 0;
					div.getElementsByTagName('button')[0].innerHTML = 'Создать';
					div.selected_a = undefined;
					div.rng = rng;
				}
					
				// покажем форму
				div.style.display = 'block'; 
				div.style.width = trg1.parentNode.parentNode.clientWidth+'px';
			}
			else if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		
/*		var url = prompt('URL: ', ''); 
		if(!!url){ 
			rte({type: 'undostackpush', target: rte_root});
			document.execCommand('createlink', false, url); 
		} */
		return;
	}
	
	// .rte_panel-btn [insertfile]
	if(rte_panel_btn_type == 'insertfile') {
		for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
			if(div.className.indexOf('rte_load_file') > -1) {
				div.style.display = 'block'; 
				div.style.width = trg1.parentNode.parentNode.clientWidth+'px' 
			}
			else if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		return;
	}
	
	// .rte_panel-btn [insertimage]
	if(rte_panel_btn_type == 'insertimage') {
		for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
			if(div.className.indexOf('rte_load_image') > -1) {
				div.style.display = 'block'; 
				div.style.width = trg1.parentNode.parentNode.clientWidth+'px';
			}
			else if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		return;
	}
	
	// .rte_panel-btn [html]
	if(rte_panel_btn_type == 'html') {
		rte({type: 'undostackpush', target: rte_root});
		for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
			if(div.className.indexOf('rte_raw_editor') > -1) {
				div.style.display = 'block'; 
				div.style.width = trg1.parentNode.parentNode.clientWidth+'px'; 
				div.getElementsByTagName('textarea')[0].value = rte_content_area.innerHTML 
			}
			else if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		return;
	}
	
	// .rte_panel-btn [youtube]
	if(rte_panel_btn_type == 'youtube') {
		rte({type: 'undostackpush', target: rte_root});
		for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
			if(div.className.indexOf('rte_load_image') > -1) {
				div.style.display = 'block'; 
				div.style.width = trg1.parentNode.parentNode.clientWidth+'px';
				div.rng = (window.getSelection) 
					? window.getSelection().getRangeAt(0)
					: document.selection.createRange();
			}
			else if(div.className.indexOf('rte_panel2') > -1)
				div.style.display = 'none'; 
		}
		
		return;
	}
	
	// .rte_panel-btn [typograph]
	if(rte_panel_btn_type == 'typograph') {
		if('typograph' in window == false) 
			alert('Error!\nwindow.typograph not defined!');
		else {
			rte({type: 'undostackpush', target: rte_root});
			trg1.parentNode.nextElementSibling.innerHTML = typograph.process(trg1.parentNode.nextElementSibling.innerHTML);
		}
		return;
	}

	// .rte_panel-btn [clean]
	if(rte_panel_btn_type == 'clean') {
		rte({type: 'undostackpush', target: rte_root});
		
		var sel = window.getSelection ? window.getSelection() : window.document.selection;
		var rng = window.getSelection ? sel.getRangeAt(0) : sel.createRange();
		var node = window.getSelection ? rng.startContainer : rng.anchorNode;
		if(node.nodeName == '#text') node = node.parentNode;
		
		if(node == rte_content_area) {
			if(!window.reformator || !rte_content_area.firstElementChild) return;
			for(var node = rte_content_area.firstElementChild; node.nextElementSibling; node = node.nextElementSibling)
				reformator.wysiwyg._format_clear_child(node);
		}
		
		// старый режим
//  		if(!window.reformator || sel.isCollapsed) {
			var parent = node.parentNode;
			var p = document.createElement('P');
			
			while(node.childNodes.length)
				// объеденяем текстовые узлы
				if(node.firstChild.nodeName == '#text' && (p.lastChild||{}).nodeName == '#text') {
					p.lastChild.nodeValue = p.lastChild.nodeValue + node.firstChild.nodeValue;
					node.removeChild(node.firstChild);
				} else
					p.appendChild(node.firstChild);
				
			
			// оборачиваем в <p> если совсем голый абзац
			if(parent == rte_content_area)
				parent.insertBefore(p, node);
			
			// или просто избавляемся от parentNode
			else 
				while(p.childNodes.length)
					parent.insertBefore(p.firstChild, node);
				
			parent.removeChild(node);
// 		}
		
		// новый режим при выделении
		/* else {
			reformator.wysiwyg._format_clear_child(node);
		} */
			
		return;
	};

	// .rte_panel-btn [undo]
	if(rte_panel_btn_type == 'undo') {
		// нет стека - нечего восстанавливать
		if( ! rte_content_area['undo_stack']) return;

		// сохраним текущие состояние под спец. именем, чтоб вернуться в него по redo
		if( ! rte_content_area.undo_stack['save_undo_start'])
			rte({type:'undostackpush', target: rte_root, undo_mode:'save_undo_start'});

		// восстановим содержимое
		if(rte_content_area.undo_stack.next > 1) {
			rte_content_area.undo_stack.next--;
			var state = rte_content_area.undo_stack['save'+rte_content_area.undo_stack.next];
			rte_content_area.innerHTML = state.innerHTML;
			rte_content_area.scrollTop = state.selection[0];

			// восстановим выделение
			if(window.getSelection) try { // FF
			var rng = document.createRange();
	
			// начало выделения
			var start = rte_content_area;
			for(var i = 1; i < state.selection[1].length; i++)
				if(start.childNodes.length > state.selection[1][i])
				start = start.childNodes[state.selection[1][i]];
			rng.setStart(start, state.selection[1][i-1]);

			// конец выделения
			var end = rte_content_area;
			for(var i = 1; i < state.selection[2].length; i++)
				if(end.childNodes.length > state.selection[2][i])
				end = end.childNodes[state.selection[2][i]];
			rng.setEnd(end, state.selection[2][i-1]);

			// выделим
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(rng);
			} catch(ex) { /* skip */ }
		}
		
		return;
	}

	// .rte_panel-btn [redo]
	if(rte_panel_btn_type == 'redo') {

		// нет стека - нечего восстанавливать
		if( ! rte_content_area['undo_stack']) return;

		// переключем указатель вперёд, если есть куда
		if('save'+rte_content_area.undo_stack.next in rte_content_area.undo_stack)
			rte_content_area.undo_stack.next++;

		// восстановим состояние
		if('save'+rte_content_area.undo_stack.next in rte_content_area.undo_stack)
			var state = rte_content_area.undo_stack['save'+rte_content_area.undo_stack.next];
		else {
			if(!! rte_content_area.undo_stack['save_undo_start'])
				var state = rte_content_area.undo_stack['save_undo_start'];    
			else
				return;
		}

		// восстановим содержимое
		rte_content_area.innerHTML = state.innerHTML;
			
		// восстановим прокрутку
		rte_content_area.scrollTop = state.selection[0];

		// восстановим выделение
		if(window.getSelection) try { // FF
			var rng = document.createRange();
			
			// начало выделения
			var start = rte_content_area;
			for(var i = 1; i < state.selection[1].length; i++)
			if(start.childNodes.length > state.selection[1][i])
				start = start.childNodes[state.selection[1][i]];
			rng.setStart(start, state.selection[1][i-1]);

			// конец выделения
			var end = rte_content_area;
			for(var i = 1; i < state.selection[2].length; i++)
			if(end.childNodes.length > state.selection[2][i])
				end = end.childNodes[state.selection[2][i]];
			rng.setEnd(end, state.selection[2][i-1]);

			// выделим
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(rng);
		} catch(ex) { /* skip */ }
		
		return;
	}
	
	// .rte_panel-btn [...]
	if(rte_panel_btn_type != '(unknown)') {
		rte({type:'undostackpush', target:rte_root});
		document.execCommand(rte_panel_btn_type, false, false);
		return;
	}

}

rte.default_config = { 
	width: '526px', 
	height: '15em', 
	"class": '',
	toolbar: 'h1 h2 bold italic underline createlink unlink color undo redo insertimage clean html youtube', 
	onpaste_allow: 'h1 h2 h3 h4 h5 i em span strong b u ul ol li p br a img table tbody thead tfoot tr td th iframe object embed param', 
	onpaste_allow_attr_in: 'a img td iframe object embed param', 
	toolbar_btn_png: '/rte.png',
	upload_image_action: /* undefined, */ '/server_side_api.php?action=upload_file',
	upload_image_input_file: 'file',
	upload_image_hidden1: ['original_save_to', '/images/'],
	upload_image_hidden2: ['resize_1200x1200_inbox_then_save_to', '/images/1200x1200/'], 
	upload_image_hidden3: ['resize_200x150_fill_then_save_to', '/images/200x150/'], 
	upload_image_callback_func_constructor: function(rte_id, conf) { return function(resp) { 
		rte({
			type: 'imageuploadresponse', 
			target: document.getElementById(rte_id), 
			result: resp.result,
			message: resp.message||'',
			img_src: resp[(conf.upload_image_hidden3||conf.upload_image_hidden2||conf.upload_image_hidden1)[0]],
			img_alt: resp.source_name,
			img_class: ''
		}); 
	}},
	upload_file_action: /* undefined, */ '/server_side_api.php?action=upload_file',
	upload_file_input_file: 'file',
	upload_file_hidden1: ['original_save_to', '/files/'],
	upload_file_callback_func_constructor: function(rte_id, conf) { return function(resp) { 
		rte({
			type: 'fileuploadresponse', 
			target: document.getElementById(rte_id), 
			result: resp.result,
			message: resp.message||'',
			a_href: conf.upload_file_hidden1[1]+resp.name,
			a_innerHtml: resp.source_name||resp.name||'',
			a_title: resp.source_name||resp.name||'',
			a_class: '',
			a_target: '_blank'
		}); 
	}},
};

// TinyMCE compatabality
rte.init = function(conf){ 
	document.addEventListener('DOMContentLoaded',(function(){
		return function() {

			// переведём панели инструментов в наш формат
			if(!conf.toolbar) {
				conf.toolbar = [];
				for(var f in conf) if(f.match(/^theme_advanced_buttons[0-9]/)) {
					var btns = conf[f].split(',');
					for(var i = 0; i < btns.length; i++) 
					switch(btns[i]){
						case '|': break;
						case 'forecolor': conf.toolbar.push('color'); break;
						case 'link': conf.toolbar.push('createlink'); break;
						case 'sup': conf.toolbar.push('superscript'); break;
						case 'sub': conf.toolbar.push('subscript'); break;
						case 'numlist': conf.toolbar.push('insertorderedlist'); break;
						case 'bullist': conf.toolbar.push('insertunorderedlist'); break;
						case 'image': conf.toolbar.push('insertimage'); break;
						case 'media': conf.toolbar.push('insertfile'); break;
						case 'cleanup': conf.toolbar.push('typograph'); break;
						case 'removeformat': conf.toolbar.push('clean'); break;
						case 'code': conf.toolbar.push('html'); break;
						case 'hr': conf.toolbar.push('inserthorizontalrule'); break;
						default: conf.toolbar.push(btns[i]);
					}
				}
				conf.toolbar = conf.toolbar.join(' ');
			}
			
			switch(conf.mode || '') {
				case "textareas": 
				case "specific_textareas":
					var list = document.querySelectorAll(conf.editor_selector 
						? 'textarea.'+conf.editor_selector
						: 'textarea');
					for(var i = 0; i < list.length; i++)
						rte(list[i], undefined, conf);
					break;
				case "exact": 
					if(conf.elements) {
						for(var ids = conf.elements.split(','); ids.length;) {
							var elem = document.getElementById(ids.pop());
							if(elem) rte(elem);
						}
					}
					return;
				case "none":
				default: break;
			}
		}
	})(/* bind conf argument! */));
};

rte.get = function(id1){ 
	return {
		getBody:function(){ 
			var tmp = document.getElementById(id1).value;
			return {innerHTML: tmp}; 
		},
		getContent: function() {
			var rte_editor = document.getElementById('rte_for_'+id1);
			return rte_editor.firstChild.nextElementSibling.innerHTML;
		}
	}; 
};
