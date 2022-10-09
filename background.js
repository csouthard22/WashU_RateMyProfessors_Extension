chrome.runtime.onMessage.addListener(
    function(message, sender, onSuccess) {
        fetch(message.message)
            .then(response => response.text())
            .then(responseText => onSuccess(
              //send message back to tasks.js with html content
              chrome.tabs.sendMessage(sender.tab.id, {message:responseText,id:message.id,name:message.name,lastName:message.lastName,secondSearch:message.secondSearch})
  
            ))
            
        
        return true // Will respond asynchronously.
    }
  );