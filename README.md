# rte.js
JavaScript HTML WYSIWYG editor

## Example

```html
	<!doctype html>
	<html>
		<head>
			<title>rte.js - Example</title>
			<script src="http://example.com/rte.js" type="text/javascript"></script>
		</head>
		<body>
			<div id="editor_container">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</div>
			<script type="text/javascript">
				var editor_container = document.getElementById('editor_container');
				
				var editor_code = rte('editor1', 
					editor_container.innerHTML, 
					{
						width: '700',
						height: '500',
						toolbar: 'h1 h2 bold italic underline createlink unlink color undo redo insertimage clean html youtube'
					});
				
				editor_container.innerHTML = editor_code;
			</script>
		</body>
	</html>
```

## Default config

```javascript
var conf = { 
	width: '526px', 
	height: '15em', 
	"class": '',
	toolbar: 'h1 h2 bold italic underline createlink unlink color undo redo insertimage clean html youtube', 
	onpaste_allow: 'h1 h2 h3 h4 h5 i em span strong b u ul ol li br img table tbody thead tfoot tr td th', 
	onpaste_allow_attr_in: 'a img td', 
	upload_image_action: '/server_side_api.php?action=upload_file',
	upload_image_input_file: 'file',
	upload_image_hidden1: ['original_save_to', '/images/'],
	upload_image_hidden2: ['resize_1024x1024_inbox_then_save_to', '/images/1024x1024/'], 
	upload_image_hidden3: ['resize_200x150_fill_then_save_to', '/images/200x150/'], 
	upload_image_callback_func: function(resp) { 
		rte({
			type: 'imageuploadresponse', 
			target: document.getElementById(rte_id), 
			result: resp.result,
			message: resp.message||'',
			img_src: resp[(conf.upload_image_hidden3||conf.upload_image_hidden2)[0]],
			img_alt: resp.source_name,
			img_class: ''
		}); },
	upload_file_action: '/server_side_api.php?action=upload_file',
	upload_file_input_file: 'file',
	upload_file_hidden1: ['original_save_to', '/images/'],
	upload_file_callback_func: function(resp) { 
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
		}); },
};
```