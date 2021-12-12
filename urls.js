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
      alert('Saved successfully');
    });
  });
  
  chrome.storage.local.get(['blacklist', 'disabled'], res => {
    if (res && res.blacklist) {
      blacklist = res.blacklist;
      input.value = blacklist;
    }
    if (res && res.disabled != undefined) {
      setStatus(res.disabled);
    }
  });

  statusButton.addEventListener('click', (event) => {
    const disabled = JSON.parse(event.target.value) === true;
    if (disabled) {
      chrome.storage.local.set({'disabled': false}, () => {
      });
      setStatus(false);
    }
  });
  
  const setStatus = (status) => {
    const disabled = status === true;
    statusButton.innerHTML = disabled ? 'Enable' : 'Disable';
    statusButton.value = status;
    statusButton.disabled = !disabled;
  };
};
