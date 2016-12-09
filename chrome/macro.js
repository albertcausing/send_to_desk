insertTextAtCursor(macro_text);
function insertTextAtCursor(text) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
			var div = document.createElement('div');
			div.innerHTML = text.replace(/\n\r?/g, '<br />');
            range.insertNode( div );
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}