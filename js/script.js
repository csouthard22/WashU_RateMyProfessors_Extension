//Functional Ver 2
//Fetch ratings with displaying but no hover 




$(document).ready(function () {


  //Append rating container for each professor
  $(document).on('mouseenter', 'a.instructorLink', function () {
      if (!$(this).next().is('b')) {
          console.log("Create!");
          var wrapper = "<b class='tooltip' style='font-size:15px; display:none; width:160px; height:auto; background-color:#51545c; color:#f9f9f9; text-align:center; border-radius:6px; padding:5px; position:absolute; z-index:1;'>Loading...</b>";
          $(this).after(wrapper);
      }

      // $('a.instructorLink').each(function(index){
      //   var wrapper = "<b class='tooltip' style='display: none;width: auto;background-color: rgb(180, 180, 180);color: #f9f9f9;text-align: center;border-radius: 6px;padding: 5px 0;position: absolute;z-index: 1;'>Loading...</b>";
      //   $(this).after(wrapper);

      // })

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

              //get Professors' full names by fetching their link 
              var instructorURL = $(this).attr("href");
              fetch(instructorURL)
                  .then(response => response.text())
                  .then(responseText => {
                      let start = '<span id="oInstructorResults_lblInstructorName">';
                      let result = responseText.substring(responseText.indexOf(start) + start.length, responseText.indexOf('</span></strong>') - 1);
                      let name = result.replace(/\s+/g, ' ');

                      //send search query link to the background 
                      var url = "http://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc="; 
                      chrome.runtime.sendMessage(
                          { from: "tasks", message: url, id: instructorURL, name:name }
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
      if(keys[1] == "client:root:newSearch"){
        if(values[2].resultCount==0){
            $("[href='" + id + "']").next().text("No Result Found.");
            $("[href='" + id + "']").next().append("<a href='http://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc=' target='_blank'>Verify</a>");
        }
        else{
          console.log("Extracting prof legacy id...");
          jsonResp = values[4];
          if (jsonResp.school.__ref == "U2Nob29sLTExNDc=") {
              console.log("Found one!");
              var legacyId = values[4].legacyId;
              console.log(legacyId);
              //send prof page link to the background 
              var url = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + legacyId; 
              console.log("Sending target URL to Service Worker!" + url);
              chrome.runtime.sendMessage(
                  { from: "tasks", message: url, id: id }
              );
          }
              else{
                $("[href='" + id + "']").next().text("No WashU Professor Found.");
                $("[href='" + id + "']").next().append("<a href='http://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc=' target='_blank'>Verify</a>");
              }
        }
        
      }
      else{
        try {
          var jsonResp = values[1];

          if(jsonResp.avgRating==0){
            $("[href='" + id + "']").next().text("No Rating");
          }
          else{
            $("[href='" + id + "']").next().text("Rating: " + jsonResp.avgRating + "/5");
          }
          
          if(jsonResp.wouldTakeAgainPercent == -1){
            $("[href='" + id + "']").next().append("<p>No Response</p>");
          }
          else{
            $("[href='" + id + "']").next().append("<p>Would Take Again: " + jsonResp.wouldTakeAgainPercent + "%</p>");
          }

          if(jsonResp.avgDifficulty==0){
            $("[href='" + id + "']").next().append("<p>No Response");
          }
          else{
            $("[href='" + id + "']").next().append("<p>Level of Difficulty: " + jsonResp.avgDifficulty + "</p>");
          }

          $("[href='" + id + "']").next().append("<a href='https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + jsonResp.legacyId + "' target='_blank'>Details</a>");
          
            //   console.log("Not a WashU Professor");
            //   $("[href='" + id + "']").next().text("No Rating");
          
        } catch (error) {
          $("[href='" + id + "']").next().text("Something went wrong...");
        }
      }

      
      

  });

  // //WUSTL data
  // var professorFullName = $("#oInstructorResults_lblInstructorName").text().trim().replace(/\s+/g, ' ');
  // var professorTableCellCopy = $("#oInstructorResults_divSingleInstructor > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(2)");
  // var clone = professorTableCellCopy.clone()
  // clone.css({"padding-left": "15px"})

  // clone.find('span').first().text("Loading rating...")
  // clone.find('span').eq(1).text("Loading level of difficulty...")
  // clone.find('div').first().text("Loading would take again rate...")
  // clone.find('div').first().text("Loading URL")

  // professorTableCellCopy.parent().append(clone)

  // //rate my professor rating value
  // var scrapeUrl = "http://www.ratemyprofessors.com/search/teachers?query="+professorFullName+"&sid=U2Nob29sLTExNDc="

  // chrome.runtime.sendMessage( //goes to bg_page.js
  //   {from:"tasks",message:scrapeUrl}
  // ); 

  // //listen to the message back 
  // chrome.runtime.onMessage.addListener(function (response, sendResponse) {

  //   let kw = "window.__RELAY_STORE__ = ";
  //   let result = response.substring(response.indexOf(kw) + kw.length , response.indexOf('window.process = {}') - 1);
  //   result = result.replace(/;\s*$/, ""); //remove last ;
  //   var jsonResult = JSON.parse(result)
  //   console.log(jsonResult)
  //   var keys = []
  //   var values = []
  //   for (var key in jsonResult) {
  //       if (jsonResult.hasOwnProperty(key)) {
  //           keys.push(key)
  //           values.push(jsonResult[key])
  //       }
  //   }

  //   try {
  //     var jsonResp = values[4]

  //     if (jsonResp.school.__ref != "U2Nob29sLTExNDc="){
  //       clone.find('span').first().text("No rating found.")
  //     }
  //     else{
  //       clone.find('span').first().text("Rating: "+ jsonResp.avgRating + "/5")
  //       clone.find('span').eq(1).text("Level of difficulty: "+ jsonResp.avgDifficulty)
  //       clone.find('div').first().text("Would take again: "+jsonResp.wouldTakeAgainPercent)
  //       var link = '<a href="https://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + jsonResp.legacyId +'"> Go to RMP </a>';
  //       link = String(link);
  //       console.log(link);
  //       clone.find('div').first().html(link);

  //     }


  //   } catch (error) {
  //     clone.find('span').first().text("No rating found.")

  //   }

  // });





  // //END OF DOCUMENT


  //https://www.ratemyprofessors.com/search/teachers?query=Jonathan%20Shidal%20&sid=U2Nob29sLTExNDc=
  //https://www.ratemyprofessors.com/search/teachers?query=Jonathan%20Shidal%20&sid=U2Nob29sLTExNDc=
});