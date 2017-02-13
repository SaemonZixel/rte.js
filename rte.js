// rte - rich text editor
// version: 0.3
// Author: Saemon Zixel, 2012-2017, http://saemonzixel.ru/
// Public Domain. Do with it all you want.

function rte(id, content) {
	// если передали Event
	if(typeof id == 'object') {
		var ev = id || window.event;
		var trg1 = ev.target || ev.srcElement || document.body.parentNode;
// console.log(trg1);
		
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
		
		// .rte_panel-btn [createlink]
		if(trg1.className.indexOf('rte_panel-btn') > -1 && (trg1.style.background||'').indexOf(window.rte_commands['createlink']) > -1) {
			var url = prompt('URL: ', ''); 
			if(!!url){ 
				save_into_undo_stack(this); 
				document.execCommand('createlink', false, url); 
			}
		}
		
		// .rte_panel-btn [insertfile]
		if(trg1.className.indexOf('rte_panel-btn') > -1 && (trg1.style.background||'').indexOf(window.rte_commands['insertfile']) > -1) {
			for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
				if(div.className.indexOf('rte_load_file') > -1) {
					div.style.display = 'block'; 
					div.style.width = trg1.parentNode.parentNode.clientWidth+'px' 
				}
				else if(div.className.indexOf('rte_panel2') > -1)
					div.style.display = 'none'; 
			}
		}
		
		// .rte_panel-btn [insertimage]
		if(trg1.className.indexOf('rte_panel-btn') > -1 && (trg1.style.background||'').indexOf(window.rte_commands['insertimage']) > -1) {
			for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
				if(div.className.indexOf('rte_load_image') > -1) {
					div.style.display = 'block'; 
					div.style.width = trg1.parentNode.parentNode.clientWidth+'px';
				}
				else if(div.className.indexOf('rte_panel2') > -1)
					div.style.display = 'none'; 
			}
		}
		
		// .rte_panel-btn [html]
		if(trg1.className.indexOf('rte_panel-btn') > -1 && (trg1.style.background||'').indexOf(window.rte_commands['html']) > -1) {
			save_into_undo_stack(trg1);
			for(var div = trg1.parentNode.parentNode.firstElementChild; div.nextElementSibling; div = div.nextElementSibling){
				if(div.className.indexOf('rte_raw_editor') > -1) {
					div.style.display = 'block'; 
					div.style.width = trg1.parentNode.parentNode.clientWidth+'px'; 
					div.firstChild.value = this.parentNode.nextSibling.innerHTML 
				}
				else if(div.className.indexOf('rte_panel2') > -1)
					div.style.display = 'none'; 
			}
		}
		
		// .rte_panel-btn [youtube]
		if(trg1.className.indexOf('rte_panel-btn') > -1 && (trg1.style.background||'').indexOf(window.rte_commands['youtube']) > -1) {
			save_into_undo_stack(trg1);
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
		}
		
		// .rte_panel-btn [typograph]
		if(trg1.className.indexOf('rte_panel-btn') > -1 && (trg1.style.background||'').indexOf(window.rte_commands['typograph']) > -1) {
			save_into_undo_stack(trg1);
			trg1.parentNode.nextElementSibling.innerHTML = typograph.process(trg1.parentNode.nextElementSibling.innerHTML);
		}
	}
	
    var rte_id = 'rte_for_'+id;
    var rte_css = [
		'.rte_panel { background-color:#EFEFEF;height:24px;border:1px solid #CCC;border-bottom:none;padding:0 1px;-moz-user-select:none; }',
		'.rte_panel-btn { width:18px;height:18px;display:inline-block;border:1px solid #efefef;margin:2px 1px;outline:0;background:url(/rte.png) 0 0 }\n',
		'.rte_panel-btn:hover { border-color: #666 }\n'
  	];
	
    // примем настройки, если есть
    var conf = { 
		width: '526px', 
		height: '15em', 
		toolbar: 'h1 h2 bold italic underline createlink unlink color undo redo insertimage clean html youtube', 
		onpaste_allow: 'h1 h2 h3 h4 h5 i em span strong b u ul ol li br img p', 
		onpaste_allow_attr_in: 'a img', 
		upload_image_action: '/server_side_api.php?action=upload_file',
		upload_image_input_file: 'file',
		upload_image_hidden1: ['original_save_to', '/images/'],
		upload_image_hidden2: ['resize_1024х1024_inbox_then_save_to', '/images/1024x1024/'], 
		upload_image_hidden3: ['resize_200x150_fill_then_save_to', '/images/200x150/'], 
		upload_file_action: '/server_side_api.php?action=upload_file',
		upload_file_input_file: 'file',
		upload_file_hidden1: ['original_save_to', '/images/'],
		"class": ''};
    if(arguments.length > 2) 
      for(var f in arguments[2]) conf[f] = arguments[2][f];

    // начнём формировать html
    var rte_html = '<div id="'+rte_id+'" style="width:'+conf.width+';position:relative" class="'+conf["class"]+'" oninput="return rte(event)"><div class="rte_panel" unselectable="on" onclick="return rte(event)">';

    // наполняем панель инструментов
    var commands = window.rte_commands = {bold: '-56px', italic: '-128px', underline: '-344px', undo: '-488px', redo:'-506px', superscript: '-309px', justifyleft: '-164px', justifyright: '-236px', justifycenter: '-74px', insertorderedlist: '-182px', insertunorderedlist: '-326px', inserthorizontalrule: '-92px', createlink: '-380px', unlink: '-398px', insertimage: '-434px', h1: '-565px', h2: '-585px', h3: '-605px', h4: '-544px', clean: '-219px', html: '-2px', insertfile: '-644px', youtube: '-646px', typograph: '-666px'};
    var toolbar = conf.toolbar.split(' ');
    var but_tmpl = '<a class="rte_panel-btn" href="javascript:void(0)" unselectable="on" style="background:url(/rte.png) 0 0"></a>'
    for(var i=0; i < toolbar.length; i++)
      switch(toolbar[i]) {
        case 'clean':
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;" onclick="save_into_undo_stack(this);clean_format()"');  
          break;
        case 'h1': 
        case 'h2':
		case 'h3':
        case 'h4': 
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;" onclick="save_into_undo_stack(this);document.execCommand(\'strikethrough\', false, false);'+rte_id+'_wrap_unwrap(this, \''+toolbar[i]+'\')"');          
          break;
        case 'createlink':
		case 'html':
        case 'youtube':
        case 'insertimage':
		case 'insertfile':
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;"');
          break;
        case 'undo':
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;" onclick="restore_from_undo_stack(this)"');
          break;
        case 'redo':
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;" onclick="redo_from_undo_stack(this)"');
          break;
        case 'color':
          var colors = {'чёрный':'black','красный':'red','синий':'#3366ff','зелёный':'#008000','оранжевый':'#ff6600','серый':'#808080','коричневый':'#993300','коричневый':'#964B00','фиолетовый':'#53377A'};
          rte_html += '<select onchange="'+rte_id+'_colorChanged(this)" style="height:20px;width:9em;float:left;border:1px solid silver;margin:2px 1px;outline:0;font-weight:bold;color:black;padding:1px 2px">';
          for(var f in colors)
            rte_html += '<option style="font-weight:bold;color:'+colors[f]+';padding:1px 2px">'+f+'</option>';
          rte_html += '</select>';
          break;
        case 'preview':
          rte_html += but_tmpl.replace(/background:[^"]+">/, 'float:right;width:auto;text-docaration:none;color:gray;padding:0 2px" onclick="content_preview(this.parentNode.nextSibling.innerHTML)">Предпросмотр');
          break;
        case 'typograph':
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;"');
          break;
        default:
          rte_html += but_tmpl.replace(/0 0"/, commands[toolbar[i]]+' 0;" onclick="save_into_undo_stack(this);document.execCommand(\''+toolbar[i]+'\', false, false)"');
          break;
      }
    
    // Область редактирования
    rte_html += '</div><div class="rte_content" name="'+id+'" style="height:'+conf.height+';overflow-y:scroll;border:1px solid #ccc;outline:0;padding:3px;" contentEditable="true" onpaste="var a=this;setTimeout(function(){ a.innerHTML = strip_tags(a.innerHTML,  \''+conf.onpaste_allow+'\', \''+conf.onpaste_allow_attr_in+'\')}, 20)" onfocus="setTimeout(function(){ try{ document.execCommand(\'styleWithCSS\', false, false); }catch(e){}; }, 20);" onkeydown="return check_key_and_save_into_undo_stack(this, event)" onkeypress="try{ this.parentNode.rng=(window.getSelection)?window.getSelection().getRangeAt(0):document.selection.createRange(); } catch(e){ this.parentNode.rng=false; }" onclick="try{ this.parentNode.rng=(window.getSelection)?window.getSelection().getRangeAt(0):document.selection.createRange(); } catch(e){ this.parentNode.rng=false; }" ondblclick="document.'+rte_id+'_imageAlign(event, this)">'+content+'</div>';
    
    // Панель загрузки изображения
	rte_css.push('.rte_panel2 { background:#EFEFEF; border:1px solid #CCC; display:none; position:absolute; bottom:0; left:0; min-width:'+conf.width+'; color:black; text-shadow: none; box-sizing: border-box; -moz-box-sizing: border-box; }\n'+
		'.rte_panel2-row { margin:4px; font-size: 13px; }\n'+
		'.rte_input { width:227px;border:1px solid #999;padding:1px 2px; }\n'+
		'.rte_file { color: black; }\n'+
		'.rte_panel2-rside { position:absolute;right:4px;bottom:4px; }\n'+
		'.rte_panel2 button { padding:2px }\n'+
		'.rte_panel2 iframe { height:0;width:0;visibility:hidden;position:absolute; }\n'+
		'.rte_panel2 label { width: 115px; display: inline-block; }\n'+
		'.rte_load_image label { width: 50px; }\n'
	);
    rte_html += '<div class="rte_panel2 rte_load_image">'+
    '<form action="'+conf.upload_image_action+'" target="forupload" method="post" enctype="multipart/form-data" onsubmit="if(this.childNodes[1].lastChild.value.match(/^ *$/)) return true; else '+rte_id+'_imageUploaded({result:true,filename_dir:this.childNodes[1].lastChild.value,resize1:\'\'}); return false;">'+
    '<div class="rte_panel2-row"><label>Файл: </label><input class="rte_file" name="'+(conf.upload_image_input_file)+'" type="file" class="skip"></div>'+
    '<div class="rte_panel2-row"><label>URL: </label><input class="rte_input" type="text" value=""></div>'+
    '<input type="hidden" name="callback" value="document.'+rte_id+'_imageUploaded" class="skip">'+
	'<input type="hidden" name="'+conf.upload_image_hidden1[0]+'" value="'+conf.upload_image_hidden1[1]+'" class="skip">'+
	'<input type="hidden" name="'+conf.upload_image_hidden2[0]+'" value="'+conf.upload_image_hidden2[1]+'" class="skip">'+
	'<input type="hidden" name="'+conf.upload_image_hidden3[0]+'" value="'+conf.upload_image_hidden3[1]+'" class="skip">'+
	'<div class="rte_panel2-rside"><button type="submit">Вставить</button><button onclick="this.parentNode.parentNode.parentNode.style.display=\'none\';return false">Отменить</button></div>'+
    '</form><iframe name="forupload" id="iframe_forupload"></iframe></div>';

	rte_html += '<div class="rte_panel2 rte_load_file">'+
    '<form action="'+conf.upload_file_action+'" target="forupload" method="post" enctype="multipart/form-data" onsubmit="if(this.childNodes[1].lastChild.value.match(/^ *$/)) return true; else '+rte_id+'_imageUploaded({result:true,filename_dir:this.childNodes[1].lastChild.value,resize1:\'\'}); return false;">'+
    '<div style="padding:4px">Файл: </span><input name="'+conf.upload_file_input_file+'" type="file" class="skip"></div>'+
    '<div style="padding:0 4px 4px">URL: <input type="text" value="" style="width:227px;border:1px solid #999;padding:1px 2px;"></div>'+
    '<input type="hidden" name="callback" value="document.'+rte_id+'_fileUploaded" class="skip">'+
	'<input type="hidden" name="'+conf.upload_file_hidden1[0]+'" value="'+conf.upload_file_hidden1[1]+'" class="skip">'+
	'<div class="rte_panel2-rside"><button type="submit">Вставить</button><button onclick="this.parentNode.parentNode.parentNode.style.display=\'none\';return false" style="padding:2px">Отменить</button></div>'+
    '</form></div>';
    
    // Панель редактирования чистого HTML
    rte_html += '<div class="rte_panel2 rte_raw_editor" style="width:99%;padding:2px;text-align:right"><textarea style="width:98%;height:'+(parseInt(conf.height)/2)+conf.height.replace(/^[0-9]*/,'')+'"></textarea><button onclick="this.parentNode.parentNode.childNodes[1].innerHTML = this.parentNode.firstChild.value;">применить</button><button onclick="this.parentNode.style.display=\'none\'">закрыть</button></div>';

    // Панель вставки произвольного HTML-кода
    rte_html += '<div class="rte_html_insert" style="background:#EFEFEF;border:1px solid #CCC;display:none;position:absolute;bottom:0;left:0;width:99%;padding:2px;text-align:right"><textarea style="width:98%;height:'+(parseInt(conf.height)/2)+conf.height.replace(/^[0-9]*/,'')+'"></textarea><button onclick="insert_html(document.getElementById(\''+rte_id+'\').rng, this.previousSibling.value);this.parentNode.style.display=\'none\'">вставить</button><button onclick="this.parentNode.style.display=\'none\'">закрыть</button></div>';

    // Панель редактирования параметров изображения
    rte_html += '<div class="rte_panel2 rte_image_edit"><div class="rte_panel2-row"><label>Alt: </label><input class="rte_input"></div>'+
    '<div class="rte_panel2-rside"><button onclick="var img=this.parentNode.parentNode.selected_img; var inputs=this.parentNode.parentNode.getElementsByTagName(\'input\'); img.setAttribute(\'alt\', inputs[0].value); img.setAttribute(\'width\',inputs[1].value); img.setAttribute(\'height\',inputs[2].value); img.setAttribute(\'align\', [\'\',\'left\',\'right\'][this.parentNode.parentNode.getElementsByTagName(\'select\')[0].selectedIndex])">Применить</button><button onclick="this.parentNode.parentNode.style.display=\'none\';return false">Закрыть</button></div>'+
    '<div class="rte_panel2-row"><label>Выравнивание: </label><select><option value="none">нет</option><option value="left">по левому краю</option><option value="right">по правому краю</option></select></div>'+
    '<div class="rte_panel2-row"><label>Размер, пикс: </label><input class="rte_input edit_img_width" style="width:3em;">&nbsp;&times;&nbsp;<input class="rte_input edit_img_height" style="width:3em;"></div></div>';
 
    // CSS
	var style = document.createElement('style');
	style.type = 'text/css';
	if(style.styleSheet)
		style.styleSheet.cssText = rte_css;
	else
		style.appendChild(document.createTextNode(rte_css.join('\n')));
	document.getElementsByTagName('head')[0].appendChild(style);
	
    document[rte_id+'_imageUploaded'] = function(resp) {
      if(!resp.result) return alert(resp.message || resp);
      save_into_undo_stack(document.getElementById(rte_id).childNodes[1], false, document.getElementById(rte_id).rng);
      insert_html(document.getElementById(rte_id).rng, '<img src="'+resp[conf.upload_image_hidden3[0]]+'" alt="'+(resp.source_name||'').replace(/"/g, '&qoute;')+'">');
      document.getElementById(rte_id).childNodes[2].style.display = 'none';
      document.getElementById('iframe_forupload').src = 'about:blank';
    };

    document[rte_id+'_fileUploaded'] = function(resp) {
      if(!resp.result) return alert(resp.message || resp);
	  
      save_into_undo_stack(document.getElementById(rte_id).childNodes[1], false, document.getElementById(rte_id).rng);
	  
	  insert_html(document.getElementById(rte_id).rng, '<a href="/images/'+resp.name+'" target="_blank">'+resp.source_name+'</a>');
	  
      document.getElementById(rte_id).childNodes[3].style.display = 'none';
      document.getElementById('iframe_forupload').src = 'about:blank';
    };
    
    document[rte_id+'_colorChanged'] = function(select) {
      var opt = select.options[select.selectedIndex];
      select.style.color = opt.style.color;
      save_into_undo_stack(select);
      document.execCommand('strikethrough', false, false);
      replace_strike(select, 'span style="color:'+opt.style.color+'"', new RegExp('color:[^;]+;?', 'i'));
    };
    
    document[rte_id+'_imageAlign'] = function(event, div) {
      var ev = event || window.event;
      var el = event.target || event.srcElement; 
      if(el.nodeName.match(/^img$/i)) { 
        for(var n = 2; n < div.parentNode.childNodes.length; n++)
          div.parentNode.childNodes[n].style.display = 'none';
        var panel = div.parentNode.childNodes[6];
        panel.style.width = div.parentNode.clientWidth+'px'
        panel.selected_img = el; 
        var inputs = panel.getElementsByTagName('input'); 
        if(el.getAttribute('alt')) 
          inputs[0].value = el.getAttribute('alt'); 
        inputs[1].value = el.clientWidth; 
        inputs[2].value = el.clientHeight; 
        panel.getElementsByTagName('select')[0].selectedIndex = (el.getAttribute('align') ? {none:0,left:1,right:2}[el.getAttribute('align')] : 0); 
        panel.style.display='block';
      }
    };
    
	document[rte_id+'_wrap_unwrap'] = function(a, tag) {
		var div = a.parentNode.parentNode.childNodes[1];
		var unwrap_mode = false;
		var parts = div.innerHTML.split(/<st?r?i?k?e?>/i);
		for(var i=1; i < parts.length; i++) {
			var two = parts[i].split(/<\/st?r?i?k?e?>/i);
			if(two.length == 1) continue;
			
			if(parts[i-1].match(new RegExp('<'+tag+'[^>]*>$', 'img'))) {
				parts[i-1] = parts[i-1].replace(new RegExp('<'+tag+'[^>]*>$', 'img'), '');
				unwrap_mode = true;
			}
			
			if(two[1].match(new RegExp('^<'+tag+'[^>]*>', 'img'))) {
				two[1] = two[1].replace(new RegExp('^<'+tag+'[^>]*>', 'img'), '');
				unwrap_mode = true;
			}
			
			// если внутри есть указанные тег, то значит убираем его только
			if(two[0].match(new RegExp('<'+tag, 'img'))) {
				two[0] = two[0].replace(new RegExp('<'+tag+'[^>]*>', 'img'), '').replace(new RegExp('</'+tag+'[^>]*>', 'img'), '');
				unwrap_mode = true;
			} 
			
			if(unwrap_mode == false)
				parts[i] = two[0] + '</'+tag.replace(/^([^ ]+).*$/, '$1')+'>' + two[1];
		}  
    
		div.innerHTML = parts.join( unwrap_mode ? '' : '<'+tag+'>' ).replace('<'+tag+'></'+tag+'>', '');
	};
	
    return rte_html+'</div>';
}

function save_into_undo_stack(el, type, sel) {
  var div = el.nodeName.match(/^(a|select)$/i) ? el.parentNode.parentNode.childNodes[1] : el;
  
  // создадим стек если надо
  div.undo_stack = div.undo_stack || {next: 1};

  // если мы отслеживаем набор текста, то выходим, 
  // иначе надо отключить отслеживание текста в пред. сохранении
  var prev = div.undo_stack['save'+(div.undo_stack.next-1)];
  if(prev && prev.append) {
    if(type == 'keypress-tracking') return;
    prev.append = false;
  } 
  
  // выделение, либо нам его передали, либо используем текущее
  var rng = sel;
  if(!rng && window.getSelection && window.getSelection().rangeCount > 0)
    rng = window.getSelection().getRangeAt(0);
  
  // сформируем путь порядковых номеров тегов (childNodes[n1].childNodes[n2]...) 
  // из начала и конца выделения
  var start = [0, 0], end = [0, 0], cnt = 100;
  if(rng && window.getSelection) { 
    var start = [0, rng.startOffset]; // символ
    var node = rng.startContainer;
    while(!!node && cnt--) {
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
//console.log(start);

    var end = [0, rng.endOffset], cnt = 100;
    node = rng.endContainer;
    while(!!node && cnt--) {
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
//console.log(end);
  } 
  
  // если надо сохранить отдельно
  if(type == 'save_undo_start') {
    div.undo_stack['save_undo_start'] = {innerHTML: div.innerHTML, append: type=='keypress-tracking', selection: [div.scrollTop||0, start, end]};
    return;
  } 
  
  // сохраним состояние    
  div.undo_stack['save'+div.undo_stack.next] = {innerHTML: div.innerHTML, append: type=='keypress-tracking', selection: [div.scrollTop||0, start, end]};
  div.undo_stack.next++;

  // почистим
  delete div.undo_stack['save'+div.undo_stack.next]; // если откатывались по redo
  delete div.undo_stack['save_undo_start']; // это уже не актуально
}

function restore_from_undo_stack(el) {
  var div = el.nodeName.match(/^[aA]$/) ? el.parentNode.parentNode.childNodes[1] : el;
  
  // нет стека - нечего восстанавливать
  if( ! div['undo_stack']) return;

  // сохраним текущие состояние под спец. именем, чтоб вернуться в него по redo
  if( ! div.undo_stack['save_undo_start'])
    save_into_undo_stack(el, 'save_undo_start');

  // восстановим содержимое
  if(div.undo_stack.next > 1) {
    div.undo_stack.next--;
    var state = div.undo_stack['save'+div.undo_stack.next];
    div.innerHTML = state.innerHTML;
    div.scrollTop = state.selection[0];
    
    // восстановим выделение
    if(window.getSelection) try { // FF
      var rng = document.createRange();
      
      // начало выделения
      var start = div;
      for(var i = 1; i < state.selection[1].length; i++)
        if(start.childNodes.length > state.selection[1][i])
          start = start.childNodes[state.selection[1][i]];
      rng.setStart(start, state.selection[1][i-1]);

      // конец выделения
      var end = div;
      for(var i = 1; i < state.selection[2].length; i++)
        if(end.childNodes.length > state.selection[2][i])
          end = end.childNodes[state.selection[2][i]];
      rng.setEnd(end, state.selection[2][i-1]);

      // выделим
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(rng);
    } catch(e) {  }
  }
}

function redo_from_undo_stack(el) {
  var div = el.nodeName.match(/^[aA]$/) ? el.parentNode.parentNode.childNodes[1] : el;
  
  // нет стека - нечего восстанавливать
  if( ! div['undo_stack']) return;
  
  // переключем указатель вперёд, если есть куда
  if('save'+div.undo_stack.next in div.undo_stack)
    div.undo_stack.next++;
  
  // восстановим состояние
  if('save'+div.undo_stack.next in div.undo_stack)
    var state = div.undo_stack['save'+div.undo_stack.next];
  else {
    if(!! div.undo_stack['save_undo_start'])
      var state = div.undo_stack['save_undo_start'];    
    else
      return;
  }
  
  // восстановим содержимое
  div.innerHTML = state.innerHTML;
    
  // восстановим прокрутку
  div.scrollTop = state.selection[0];
  
  // восстановим выделение
  if(window.getSelection) try { // FF
    var rng = document.createRange();
    
    // начало выделения
    var start = div;
    for(var i = 1; i < state.selection[1].length; i++)
      if(start.childNodes.length > state.selection[1][i])
        start = start.childNodes[state.selection[1][i]];
    rng.setStart(start, state.selection[1][i-1]);

    // конец выделения
    var end = div;
    for(var i = 1; i < state.selection[2].length; i++)
      if(end.childNodes.length > state.selection[2][i])
        end = end.childNodes[state.selection[2][i]];
    rng.setEnd(end, state.selection[2][i-1]);

    // выделим
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rng);
  } catch(e) { }
}

function check_key_and_save_into_undo_stack(div, event) {
  var ev = event || window.event;
  var key = ev.keyCode ? ev.keyCode : (ev.which ? ev.which : null)
  
  // ctrl+z/ctrl+y
  var cancel_event = false;
  if (ev.ctrlKey || ev.metaKey)
    switch(key) {
      case 89: 
        redo_from_undo_stack(div);
        cancel_event = true;
        break;
      case 90: 
        if(ev.altKey || ev.shiftKey)
          redo_from_undo_stack(div);
        else
          restore_from_undo_stack(div);           
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
    save_into_undo_stack(div, 'keypress-tracking');
  } else {
    if('undo_stack' in div) {
      var prev = div.undo_stack['save'+(div.undo_stack.next-1)] || {};
      prev.append = false;
    }
  }

}

function insert_html(rng, html) {

  if(window.getSelection) {
	if(!rng) {
		rng = document.createRange();
		var div = document.querySelector('.rte_content');
		if(!div.lastElementChild) div.appendChild(document.createElement('BR'));
		rng.selectNode(div.lastElementChild);
		window.getSelection().addRange(rng);
	}
	  
    var div = document.createElement('DIV');
    div.innerHTML = html;
      
    if(rng.endContainer.nodeValue == null) {
      rng.endContainer.insertBefore(div, rng.endContainer.childNodes[rng.endOffset]||null);
    } else {
      var p = rng.endContainer.parentNode;
      var txt = document.createTextNode(rng.endContainer.nodeValue.substring(0, rng.endOffset));
      p.insertBefore(txt, rng.endContainer);
      p.insertBefore(div, rng.endContainer);
      rng.endContainer.nodeValue = rng.endContainer.nodeValue.substring(rng.endOffset);
    }
  } else {
	rng = document.selection.createRange();
    rng.pasteHTML(rng.htmlText + html);
  }
}

function replace_strike(a, tag) {  
  var div = a.parentNode.parentNode.childNodes[1];
  
  var parts = div.innerHTML.split(/<st?r?i?k?e?>/i);
  for(var i=1; i < parts.length; i++) {
    var two = parts[i].split(/<\/st?r?i?k?e?>/i);
    if(two.length == 1) continue;
    if(arguments.length > 2) two[0] = two[0].replace(arguments[2], '');
    parts[i] = two[0] + '</'+tag.replace(/^([^ ]+).*$/, '$1')+'>' + two[1];
  }  
    
  div.innerHTML = parts.join('<' + tag + '>');
  //div.innerHTML = div.innerHTML.replace(/<st?r?i?k?e?>/i, '<'+tag+'>').replace(/<\/st?r?i?k?e?>/i, '</'+tag+'>');
};

function strip_tags(str, allowed_tags, allow_attr_in) {
  var tags = allowed_tags.split(' ');
  
  // разбираем текст на части и фильтруем
  var lines = ('<temp>'+str).match(/(<\/?[\S][^>]*>[^<]*)/gi);
  var result = [];
  for(var i = 0; i < lines.length; i++) {
    
    // проверим, есть ли разрешённый тег в начале
    var pass = 0;
    for(var t = 0; t < tags.length; t++)
      if(lines[i].toLowerCase().indexOf('<'+tags[t]+'>') == 0 || lines[i].toLowerCase().indexOf('</'+tags[t]) == 0) {
        pass = 1;
        break;
      } else
      if(lines[i].toLowerCase().indexOf('<'+tags[t]+' ') == 0) {
        pass = 2; // потом надо будет почистить атрибуты
        break;
      } 
    
    // если прошёл проверку, пропускаем, иначе чистим
    switch(pass) {
      case 1:
        result.push(lines[i]); 
        break;
      case 2:
        if(allow_attr_in.indexOf(tags[t]) < 0)
          result.push(lines[i].replace(/^<([a-zA-Z0-9]+)[^>]+>(.*)$/mg, '<$1>$2'));
        else
          result.push(lines[i]); 
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

function clean_format() {
    var win = window;
    var sel = win.getSelection? win.getSelection(): win.document.selection;
    var rng = win.getSelection? sel.getRangeAt(0): sel.createRange();      
    if(win.getSelection) {
      var node = rng.startContainer;
      if(node.nodeName == '#text') node = node.parentNode;
    } else {
      var node = rng.parentElement();
    }
    if(node.getAttribute('class') == 'rte_content') return;
    var parent = node.parentNode;
    var text = win.document.createTextNode(node.firstChild.nodeValue); //.innerHTML.replace(/<\/?[^>]+>/gi, ' '));
    parent.insertBefore(text, node);
    parent.removeChild(node);
};