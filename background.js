let blacklist = [];
let toBeCleared = [];

let status;

function blockWindows() {
  chrome.storage.local.get(['blacklist'], res => {
    blacklist = res.blacklist;
  });
  
  chrome.tabs.query({})
        .then(res => {
          let idsByUrl = {};
          res.forEach(elem => {
            if (!toBeCleared.includes(elem.url)) {
              idsByUrl[elem.url] = elem.id;
              toBeCleared = [...toBeCleared, elem.url];
            }
          });
          blacklist.forEach(bUrl => {
            Object.keys(idsByUrl).forEach(url => {
              if (url.includes(bUrl)) {
                chrome.tabs.remove(idsByUrl[url], () => {
                  chrome.tabs.query({url:`${idsByUrl[url]}`})
                        .then(afterDelete => {
                        })
                        .catch(err => {
                          chrome.tabs.create({
                            url: 'blocked.html'
                          }).then(created => {
                            toBeCleared = toBeCleared.filter(elem => url != elem);
                          });
                        });
                });
              }
            });
          });
        }).catch(err => {
          console.log(err);
        });
};

chrome.tabs.onUpdated.addListener(function (tabId, info) {
  chrome.storage.local.get(['status'], res => {
    if (res.status) { 
      blockWindows(tabId);
    }
  });
});
