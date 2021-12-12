window.onload = () => {
  const addButton = document.querySelector('#add');
  const saveButton = document.querySelector('#save');
  const statusButton = document.querySelector('#status');

  const addListItem = (url) => {
    const inputList = document.querySelector('#input-list');
    
    const listItemWrapper = document.createElement('div');
    listItemWrapper.classList.add('list-item-wrapper');
    
    const listItem = document.createElement('li');
    listItem.innerHTML = url;
    
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove');
    removeButton.innerHTML = '&#128465;';
    removeButton.addEventListener('click', (event) => {
      const listItemWrapper = event.target.parentElement;
      document.querySelector('#input-list')
              .removeChild(listItemWrapper);
    });
    listItemWrapper.appendChild(listItem);
    listItemWrapper.appendChild(removeButton);
    inputList.appendChild(listItemWrapper);
  }
  
  addButton.addEventListener('click', (event) => {
    const input = document.querySelector('#input');
    const inputURL = input.value;
    addListItem(inputURL);
  });

  saveButton.addEventListener('click', (event) => {
    let urlsToSave = new Set();
    const listItems = document.querySelectorAll('li');

    listItems.forEach(li => {
      let url = li.innerHTML;
      url = url.trim();
      urlsToSave.add(url); 
    }); 
    chrome.storage.local.set({'blacklist':[...urlsToSave]}, () => {
      alert('Saved successfully');
    });
  });
  
  chrome.storage.local.get(['blacklist', 'disabled'], res => {
    if (res && res.blacklist) {
      res.blacklist.forEach(url => {
        addListItem(url);
      });
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
