/// <reference path="jquery-2.1.4.min.js" />
/// <reference path="tools.js" />

var ck = CKEDITOR.replace($('textarea.content')[0], {
    height: 500
});


function create() {
    $('button.new').on('click', function () {
        var $newLi = '<li class=""><h3 class="">New Note</h3><span class="closeLi close" aria-hidden="true">&times;</span><div class="content">empty note</div><div style="display: none;" class="realContent"></div><p class="time">' + calculateDatetime() + '</p><input type="hidden" class="noteId"/></li>';
        $('.noteList').prepend($newLi);

        ck.setData('');

        bindLiClick();
        bindClose();

        //setTimeout($($newLi).trigger('click'),1000);  //setNewFocus
        //alert($('p.time',$newLi).text());

        //set first li click! because new added go up to the first
        firstLiFocus();
        focusTitle();

        $('#currentNoteId').val('');
    });
}

function bindLiClick() {
    $('li').on('click', function () {
        $(this).addClass('activeLi');
        $('h3', this).addClass('activeHeader');
        $('div.content', this).addClass('activeContent').removeClass('content');
        $('div.realContent', this).addClass('activeRealContent').removeClass('realContent');

        var $siblingLis = $(this).siblings();
        $siblingLis.removeClass('activeLi');
        $('h3', $siblingLis).removeClass('activeHeader');
        $('div.activeContent', $siblingLis).addClass('content').removeClass('activeContent');
        $('div.activeRealContent', $siblingLis).addClass('realContent').removeClass('activeRealContent');

        var time = $('p.time', this).text();
        var title = $('h3', this).text();
        var content = $('div.activeContent', this).text();
        var contentHtml = $('div.activeRealContent', this).html();
        var noteId = $('.noteId', this).val();
        $('.rightSide h2 span.time').text(time);
        if (title !== 'New Note') { //有新标题
            $('input.title').val(title);
        } else {
            $('input.title').val('');
        }
        //if (content !== 'empty note') {
        //    $('textarea').val(content);
        //} else {
        //    $('textarea').val('');
        //}
        if (contentHtml !== '') {
            ck.setData(contentHtml);  
        } else {
            ck.setData('');
        }
        if (noteId !== '') {
            $('#currentNoteId').val(noteId);
        }
    });
}

function bindClose() {
    $('.closeLi').off('click').on('click', function () {
        if (confirm('are you sure to delete?')) {
            var noteId = $(this).siblings('.noteId').val();
            var deleteLi = $(this).parent();
            if (noteId === '') {
                deleteLi.remove();
            } else {
                $.post('../PanelsManagement/handlers/ModernNote.ashx', { noteId: noteId, action: 'delete' }, function (data) {
                    if (data === 'ok') {
                        $('div.alert').removeClass('alert-warning').addClass('alert-success').html('<strong>Success!</strong> Delete successfully!').show('slow').hide(3000);
                        deleteLi.remove();
                        firstLiFocus();
                    } else {
                        alert('internal server errors.');
                    }
                });
            }
        }
    });
}

function dataBinder() {
    $('input.title').on('keyup', function () {
        $('h3.activeHeader').text($(this).val());
    });
    //bind cktextarea data to left li
    ck.on('change', function () {
        var ckeditorData = ck.getData();
        if (ckeditorData !== '') {
            $('div.activeContent').text(stripHtml(ckeditorData));
            $('div.activeRealContent').html(ckeditorData);
        }
    });
}

function firstLiFocus() { //first li focus when loaded
    $('ul.noteList li:first').trigger('click');
    //alert($('ul.noteList li:first').children('.time').text());
}

function focusTitle() {
    $('input.title').focus();
}

function search() {
    $('.searchBox').on('keyup', function () {
        var searchval = $(this).val().toLowerCase();
        $('ul.noteList li h3').each(function () {
            var title = $(this).text().toLowerCase();
            (title.indexOf(searchval) == 0) ? $(this).parent().show() : $(this).parent().hide();
        });
    });
}

function initTime() {
    $('.rightSide h2 span.time').text(calculateDatetime());
    $('p.time').text(calculateDatetime());
}

function saveNote() {
    $('.rightSide button.save').on('click', function () {
        var title = $('input.title').val();
        var content = ck.getData();
        var $alertMsg = $('div.alert');
        var noteId = $('#currentNoteId').val();
        var panelId = 3520;
        if (title === '' || content === '') {
            //alert('title and content cannot be empty!');
            $alertMsg.removeClass('alert-success').addClass('alert-warning').html('<strong>Warning!</strong> title and content cannot be empty!').show('slow').hide(3000);
        } else {
            //$alertMsg.removeClass('alert-warning').addClass('alert-success').html('<strong>Success!</strong> Save successfully!').show('slow').hide(3000);
            sendData2Server(title, content, noteId, panelId, $alertMsg);
        }
    });
}


function sendData2Server(title, content, noteId, panelId, $alertMsg) {
    $.post('../PanelsManagement/handlers/ModernNote.ashx', { title: title, content: content, noteId: noteId, id: panelId }, function (data) {
        var nId = parseInt(data);
        if (nId) {  //add: return added note's Id 
            $('.activeLi input.noteId').val(nId);
            $('#currentNoteId').val(nId);
            $alertMsg.removeClass('alert-warning').addClass('alert-success').html('<strong>Success!</strong> new note created successfully!').show('slow').hide(3000);
        }
        else if (data === 'ok') { //update
            $alertMsg.removeClass('alert-warning').addClass('alert-success').html('<strong>Success!</strong> update successfully!').show('slow').hide(3000);
        } else {
            alert('data not saved, internal sever errors');
        }
    });
}

function loadData() {
    var path = window.location.pathname;
    var id = getParameterByName('PanelId');
    $.getJSON('../PanelsManagement/handlers/ModernNote.ashx', { id: 3520 }, function (data) {
        $.each(data, function (k, v) {
            var date = (eval(v.EnteredDate.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"))).pattern("yyyy-M-d h:m:s.S");
            var $Li = '<li class=""><h3 class="">' + v.NoteTitle + '</h3><span class="closeLi close" aria-hidden="true">&times;</span><div class="content">' + stripHtml(v.NoteText) + '</div><div style="display: none;" class="realContent">' + v.NoteText + '</div><p class="time">' + date + '</p><input type="hidden" class="noteId" value=' + v.Note_ID + '></li>';
            $('.noteList').append($Li);
        });

        //if (data.length === 0) {  ////我在html默认给了一个li，这里不需要了
        //    $('button.new').trigger('click');
        //}
        bindLiClick();
        bindClose();
        firstLiFocus();
        focusTitle();
    });

}

$(function () {
    loadData();
    create();
    //    bindLiClick();
    //    bindClose();
    dataBinder();
    //    firstLiFocus();
    search();
    calculateDatetime();
    initTime();
    //    focusTitle();
    saveNote();
    $('[data-toggle="tooltip"]').tooltip();
});