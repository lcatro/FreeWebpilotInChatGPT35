
console.log('Content.js Inject');

//  Code Ref: https://github.com/xcanwin/KeepChatGPT/blob/e649dcd99c5496b210386cdf3e12be39e9e6fc27/KeepChatGPT.user.js#L907

window.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, argumentsList) {
        //console.log(target, thisArg, argumentsList);  //  For Debug
        return new Promise((rs, rj) => {
            const fetchReqUrl = argumentsList[0];
            let modify = false;

            if (fetchReqUrl.match('/backend-api/conversation(\\?|$)')) {
                var postInfo = argumentsList[1];
                var postData = JSON.parse(postInfo.body);
                var userInput = postData.messages[0].content.parts[0];
                const matchURL = function(text) {
                    var pattern = /\[(https?):\/\/[^\s/$.?#].[^\s]*\]/gi;
                    var result = text.match(pattern);
                
                    return result;
                }

                var fetchUrlList = matchURL(userInput);
                if (fetchUrlList) {
                    modify = true;
                    window.addEventListener('message', function(event) {
                        if (event.source === window) {
                            let url = event.data['url'];
                            let parseHTMLData = event.data['data'];
                            let modify_userInput = postData.messages[0].content.parts[0];
                            let input_promote = '';
                            console.log('window.addEventListener',url,parseHTMLData);

                            if (Object.entries(parseHTMLData).length) { // no data
                                if (event.data.message === 'parsedHTML') {
                                    parseHTMLData = JSON.stringify(parseHTMLData);
                                    input_promote = `These Content is fetch from web page\n${parseHTMLData}\nUse the language that the user previously used or the language requested by the user.Respond to the user's request, which may include asking questions or requesting specific actions (such as translation, rewriting, etc.), based on the provided content.If the user does not make a request, perform the following tasks: 1. Display the title in the user's language; 2. Summarize the article content into a brief and easily understandable paragraph. For articles, follow this approach; for code, formulas, or content not suited for questioning, this step may be skipped.`;
                                } else if (event.data.message === 'textData') {
                                    parseHTMLData = JSON.stringify({
                                        'content': parseHTMLData
                                    });
                                    input_promote = `These Content is text data\n${parseHTMLData}\nUse the language that the user previously used or the language requested by the user.Respond to the user's request, which may include asking questions or requesting specific actions (such as translation, rewriting, etc.), based on the provided content.If the user does not make a request, perform the following tasks: 1. Display the title in the user's language; 2. Summarize the article content into a brief and easily understandable paragraph. For articles, follow this approach; for code, formulas, or content not suited for questioning, this step may be skipped.`;
                                } else {  //  nothing
                                    
                                }
    
                                if (input_promote) {
                                    modify_userInput = modify_userInput.replace(url,input_promote);
                                    console.log('before:',argumentsList[1].body);
                                    console.log('change',input_promote);
                                    postData.messages[0].content.parts[0] = modify_userInput;
                                    argumentsList[1].body = JSON.stringify(postData);
                                    console.log('after:',argumentsList[1].body);
                                }
                            }

                            // 赋值request
                            fetchRsp = target.apply(thisArg, argumentsList);
                            fetchRsp.then(response => {
                                rs(response);
                            }).catch(error => {rj(error)});
                        }
                    });
                    
                    window.postMessage({ message: 'fetchURL',fetchUrlList: fetchUrlList }, '*');
                }
            }

            if (!modify) {
                fetchRsp = target.apply(thisArg, argumentsList);
                fetchRsp.then(response => {
                    rs(response);
                }).catch(error => {rj(error)});
            }
        })
    }
});
