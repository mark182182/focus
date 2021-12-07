window.onload = () => {
  const input = document.querySelector('#input');
  const saveButton = document.querySelector('#save');
  const statusButton = document.querySelector('#status');
  let blacklist;
  
  saveButton.addEventListener('click', (event) => {
    let urlsToSave = new Set();
    input.value
         .split(',')
         .forEach(url => {
           url = url.trim();
           urlsToSave.add(url); 
         });
    chrome.storage.local.set({'blacklist':[...urlsToSave]}, () => {
      alert('saved');
    });
  });
  
  chrome.storage.local.get(['blacklist', 'status'], res => {
    if (res && res.blacklist) {
      blacklist = res.blacklist;
      input.value = blacklist;
    }
    if (res && res.status != undefined) {
      setStatus(res.status);
    }
  });

  statusButton.addEventListener('click', (event) => {
    let status = event.target.value !== 'true';
    if (status) {
      chrome.storage.local.set({'status': !status}, () => {
        setStatus(status);
      });
    }
  });
  
  const setStatus = (status) => {
    statusButton.value = status;
    statusButton.innerHTML = status ? 'Disable' : 'Enable';
    statusButton.disabled = true;
  };
};
