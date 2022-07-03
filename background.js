chrome.runtime.onMessage.addListener(
    function(message, sender, onSuccess) {
        fetch(message.message)
            .then(response => response.text())
            .then(responseText => onSuccess(
              //send message back to tasks.js with html content
              chrome.tabs.sendMessage(sender.tab.id, responseText)
  
            ))
            
        
        return true // Will respond asynchronously.
    }
  );