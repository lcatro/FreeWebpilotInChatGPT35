
const parseTextFromBody = function(bodyHTML) {
    var hidden_div = document.createElement('div');
    var cleanedHtmlCode = bodyHTML.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<textarea[\s\S]*?<\/textarea>/gi, '');
    hidden_div.innerHTML = cleanedHtmlCode;
    
    return filterChar(hidden_div.innerText);
}

const parseHTML = function(html) {
    const title_regex = /<title[^>]*>(.*?)<\/title>/i;
    const title_match = html.match(title_regex);
    if (title_match && title_match.length >= 2)
        var title_value = title_match[1];
    else
        var title_value = '';

    const site_name_regex = /<meta[^>]*property=["']og:site_name["'][^>]*content=["'](.*?)["'][^>]*>/i;
    const site_match = html.match(title_regex);
    if (site_match && site_match.length >= 2)
        var site_name_value = site_match[1];
    else
        var site_name_value = '';

    const description_regex = /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i;
    const description_match = html.match(description_regex);
    if (description_match && description_match.length >= 2)
        var description_value = description_match[1];
    else
        var description_value = '';

    const body_regex = /<body[^>]*>([\s\S]*?)<\/body>/i;
    const body_match = html.match(body_regex);
    if (body_match && body_match.length >= 2)
        var body_value = parseTextFromBody(body_match[1]);
    else
        var body_value = '';

    if (!title_value && !site_name_value && !description_value && !body_value)
        return {};

    return {
        'title': title_value,
        'site_name': site_name_value,
        'description': description_value,
        'content': body_value
    };
}

const filterChar = function(bodyText) {
    var result = bodyText.replace(/\\n/g, '').replace(/\\t/g, '').replace(/\n/g, '').replace(/\t/g, '');

    return result;
}

window.addEventListener('message', function(event) {
    //console.log(event.data,'url',event.data['fetchUrlList']);
    if (event.source === window && event.data.message === 'fetchURL') {
        var url = event.data['fetchUrlList'][0];

        if (url.startsWith("[") && url.endsWith("]"))
            url = url.slice(1, -1)  //  去除中括号.. [https://www.baidu.com/]

        chrome.runtime.sendMessage({url: url },function(response) {
            //console.log(' sendMessage Return',response);
            if (response.length) {
                var webPageDetail = parseHTML(response);

                if (Object.entries(webPageDetail).length) {
                    window.postMessage({ message: 'parsedHTML' ,data: webPageDetail,url:event.data['fetchUrlList'][0] }, event.origin);
                    console.log(' WebPage Detail',webPageDetail);
                } else {
                    window.postMessage({ message: 'textData' ,data: filterChar(response),url:event.data['fetchUrlList'][0] }, event.origin);
                    console.log(' WebPage Text',response);
                }
            } else {
                window.postMessage({ message: 'nothing' ,data: '',url:event.data['fetchUrlList'][0] }, event.origin);
                console.log(' WebPage NoData');
            }
        })
    }
});

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}

injectScript(chrome.runtime.getURL('content.js'), 'body');
