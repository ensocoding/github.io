/**
 * Google Translator function
 * @author Amit Agarwal  web: ctrlq.org          
 * 
 * This function uses the same Chrome translator service, so no auth is required.
 * It sends a GET request and receive a JSON.TXT file with the translated text
 * Adapted for vicky usage on oct-2020
 * @author EnsoCoding
 */
function doGet(e) {

    var sourceText = ''
    if (e.parameter.q) {
        sourceText = e.parameter.q;
    }

    var sourceLang = 'auto';
    if (e.parameter.source) {
        sourceLang = e.parameter.source;
    }

    var targetLang = 'ja';
    if (e.parameter.target) {
        targetLang = e.parameter.target;
    }

    /* Option 1 */
    //var translatedText = LanguageApp.translate(sourceText, sourceLang, targetLang)

    /* Option 2 */
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
        sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    var result = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    translatedText = result[0][0][0];

    var json = {
        'sourceText': sourceText,
        'translatedText': translatedText
    };

    // set JSONP callback
    var callback = 'callback';
    if (e.parameter.callback) {
        callback = e.parameter.callback
    }

    // return JSONP
    return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(json) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
}