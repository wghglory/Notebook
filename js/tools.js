function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
//var prodId = getParameterByName('prodId');

function getParameter(theParameter) {
    var params = window.location.search.substr(1).split('&');

    for (var i = 0; i < params.length; i++) {
        var p = params[i].split('=');
        if (p[0] == theParameter) {
            return decodeURIComponent(p[1]);
        }
    }
    return false;
}
//http://technicaloverload.com?test1=yes&test2=no&test3=http%3A%2F%2Ftechnicaloverload.com%2F
//getParameter('test1') --> yes
//getParameter('test2') --> no
//getParameter('test3') --> http://technicaloverload.com/
//getParameter('test4') --> false



function stripHtml(html) {
    var nohtml = html.replace(/<[^>]+>|&nbsp;/gi, '').trim();
    return nohtml.replace(/\s{2,}/, ' ');
}


function calculateDatetime() {
    var d = new Date();
    var date = d.toLocaleDateString();
    var time = d.toLocaleTimeString();
    return date + ' ' + time;
}