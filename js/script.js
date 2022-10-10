
$(document).ready(function () {


  //Append rating container for each professor
  $(document).on('mouseenter', 'a.instructorLink', function () {
      if (!$(this).next().is('b')) {
          console.log("Create!");
          var wrapper = "<b class='tooltip' style='font-size:15px; display:none; width:170px; height:auto; background-color:#d4d7ff; color:#8b0000; text-align:left; border-radius:6px; padding:10px 15px; position:absolute; z-index:1;'><span style='font-weight:normal;'>Loading...</span></b>";
          $(this).after(wrapper);
      }

  })


  $(document).on({
      mouseenter: function () {
          $(this).show();
      },
      mouseleave: function () {
          $(this).hide();
      }
  }, 'b.tooltip')


  //Show rating container and fetch rating when hover above professor link
  $(document).on({

      mouseenter: function () {

          $(this).next().show();

          if ($(this).next().text() == "Loading...") {
            $(this).next().text("Loading....");
              //get Professors' full names by fetching their link 
              var instructorURL = $(this).attr("href");
              fetch(instructorURL)
                  .then(response => response.text())
                  .then(responseText => {
                      let start = '<span id="oInstructorResults_lblInstructorName">';
                      let result = responseText.substring(responseText.indexOf(start) + start.length, responseText.indexOf('</span></strong>') - 1);
                      let name = result.replace(/\s+/g, ' ');
                      let splitedName = name.split(' ');
                      console.log(splitedName);
                      if(splitedName.length==4){
                        name = splitedName[0]+' '+splitedName[splitedName.length-2]
                      }
                      console.log("final search string: "+name);

                      //send search query link to the background 
                      var url = "https://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc="; 
                      chrome.runtime.sendMessage(
                          { from: "tasks", message: url, id: instructorURL, name:name, secondSearch:false }
                      );

                  })
              console.log("Fetching!");

          }
      },

      mouseleave: function () {
          $(this).next().hide();
      }
  },
      'a.instructorLink');







  //Upon message, replace rating contain's text with fetched rating
  chrome.runtime.onMessage.addListener(function (response, sendResponse) {
      var id = response.id;
      var name = response.name;
      console.log("Returned full name: "+name);
      var secondSearch = response.secondSearch

      //parse and extract professor info from fetched source codes
      let kw = "window.__RELAY_STORE__ = ";
      let result = response.message.substring(response.message.indexOf(kw) + kw.length, response.message.indexOf('window.process = {}') - 1);
      result = result.replace(/;\s*$/, "");
      var jsonResult = JSON.parse(result)
      var keys = []
      var values = []
      for (var key in jsonResult) {
          if (jsonResult.hasOwnProperty(key)) {
              keys.push(key)
              values.push(jsonResult[key])
          }
      }


      //Two cases
      //If incoming message is search result
      if(keys[1] == "client:root:newSearch"){

        //If it's secondary search result
        if(secondSearch == true){
          var lastName = response.lastName
          if(values[2].resultCount==0){
            console.log("No result found in second search");
            $("[href='" + id + "']").next().html("<span style='display: inline-block; font-weight:normal'>No Result Found by&nbsp</span><br/>"+name+"<br/>");
            $("[href='" + id + "']").next().append("<span style='margin-top:10px; display: inline-block; margin-left: 64px;'><a style='text-decoration: underline;' href='https://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc=' target='_blank'>Verify</a>");
          }
          else{
            jsonResp = values[4];
            if (jsonResp.school.__ref == "U2Nob29sLTExNDc=") {
              console.log("Found some results by last name");
              $("[href='" + id + "']").next().html("<span style='font-weight:normal;'>No WashU professor found by </span>"+name+"<span style='font-weight:normal;'>.<br/> Found results by last name </span>"+lastName+".<br/>");
              $("[href='" + id + "']").next().append("<span style='margin-top:10px; display: inline-block; margin-left: 42px;'><a style='text-decoration: underline;' href='https://www.ratemyprofessors.com/search/teachers?query=" + lastName + "&sid=U2Nob29sLTExNDc=' target='_blank'>View Results</a><span>"); 
            }
            else{
              console.log("No result found in second search");
              $("[href='" + id + "']").next().html("<span style='display: inline-block; font-weight:normal'>No Result Found by&nbsp</span><br/>"+name+"<br/>");
              $("[href='" + id + "']").next().append("<span style='margin-top:10px; display: inline-block; margin-left: 64px;'><a style='text-decoration: underline;' href='https://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc=' target='_blank'>Verify</a>");
            }
          }
        }
        //If it's the first search
        else{
          //If no prof found by full name, perform secondary search by last name and department
          if(values[2].resultCount==0){
            console.log("Perform Search by Last Name");
            let nameArray = name.split(' ');
            let lastName = nameArray[nameArray.length-2]
            console.log("last name search string: "+lastName);
            var url = "https://www.ratemyprofessors.com/search/teachers?query=" + lastName + "&sid=U2Nob29sLTExNDc="; 
            chrome.runtime.sendMessage(
                { from: "tasks", message: url, id: id, name:name, lastName:lastName, secondSearch:true }
            );
            $("[href='" + id + "']").next().html("<span style='display: inline-block; margin-left: 20px; font-weight:normal'>No result found by full name. Performing search by last name...</span><br/>");
          }
          //If some results found in the first search
          else{
            console.log("Extracting prof legacy id...");
            jsonResp = values[4];
            //Found a WashU professor!!!
            if (jsonResp.school.__ref == "U2Nob29sLTExNDc=") {
                console.log("Found one!");
                var legacyId = values[4].legacyId;
                console.log(legacyId);
                //send prof page link to the background 
                var url = "https://www.ratemyprofessors.com/professor?tid=" + legacyId; 
                console.log("Sending target URL to Service Worker!" + url);
                chrome.runtime.sendMessage(
                    { from: "tasks", message: url, id: id, name:name }
                );
            }
            //No WashU professor found in the first search, perform search by last name
            else{
              console.log("Perform Search by Last Name");
              let nameArray = name.split(' ');
              let lastName = nameArray[nameArray.length-2]
              var url = "https://www.ratemyprofessors.com/search/teachers?query=" + lastName + "&sid=U2Nob29sLTExNDc="; 
              chrome.runtime.sendMessage(
                  { from: "tasks", message: url, id: id, name:name, lastName:lastName, secondSearch:true }
              );
              $("[href='" + id + "']").next().html("<span style='display: inline-block; margin-left: 20px; font-weight:normal'>No Result Found by Full Name. Performing search by last name...</span><br/>");
            }
          }
        }

        
        
      }
      //If it gets here, a correct result is found
      else{
        try {
          var jsonResp = values[1];

          $("[href='" + id + "']").next().html("<span>"+jsonResp.firstName+" "+jsonResp.lastName+"</span><br/>");
          

          if(jsonResp.avgRating==0){
            $("[href='" + id + "']").next().append("<span style='font-weight:normal'>No Rating</span><br/>");
          }
          else{
            $("[href='" + id + "']").next().append("<span style='font-weight:normal'>Rating: </span>" + jsonResp.avgRating + "/5<br/>");
          }
          
          if(jsonResp.wouldTakeAgainPercent == -1){
            $("[href='" + id + "']").next().append("<span style='font-weight:normal'>No Response</span><br/>");
          }
          else{
            $("[href='" + id + "']").next().append("<span style='font-weight:normal'>Would Take Again: </span>" + Math.ceil(jsonResp.wouldTakeAgainPercent) + "%<br/>");
          }

          if(jsonResp.avgDifficulty==0){
            $("[href='" + id + "']").next().append("<span style='font-weight:normal'>No Response</span><br/>");
          }
          else{
            $("[href='" + id + "']").next().append("<span style='font-weight:normal'>Level of Difficulty: </span>" + jsonResp.avgDifficulty+"/5<br/>");
          }

          $("[href='" + id + "']").next().append("<span style='margin-top:10px; display: inline-block; margin-left: 57px;'><a style='text-decoration: underline;' href='https://www.ratemyprofessors.com/professor?tid=" + jsonResp.legacyId + "' target='_blank'>Details</a></span>");
          
        
          
        } catch (error) {
          console.log("Error: "+error)
          $("[href='" + id + "']").next().text("Something went wrong...");
        }
      }

      
      

  });

});