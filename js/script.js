//Functional Ver 1
//Fetch ratings without displaying 

$(document).ready(function(){

  // $(document).one('mouseenter','a.instructorLink',function(){

  //   $('a.instructorLink').each(function(index){
  //     var wrapper = "<b>Loading...</b>";
  //     $(this).after(wrapper);
  //   })

  // })




  $(document).on('mouseenter','a.instructorLink', function(){
    var instructorURL = $(this).attr("href");


    fetch(instructorURL)
      .then(response => response.text())
      .then(responseText => {
        let start = '<span id="oInstructorResults_lblInstructorName">';
        let result = responseText.substring(responseText.indexOf(start) + start.length , responseText.indexOf('</span></strong>') - 1);
        let name = result.replace(/\s+/g, ' ');
        
        var url = "http://www.ratemyprofessors.com/search/teachers?query="+name+"&sid=U2Nob29sLTExNDc=";
        chrome.runtime.sendMessage(
          {from:"tasks",message:url,id:instructorURL}
        );

      })



  });


  chrome.runtime.onMessage.addListener(function (response, sendResponse) {
    var id = response.id;

    let kw = "window.__RELAY_STORE__ = ";
    let result = response.message.substring(response.message.indexOf(kw) + kw.length , response.message.indexOf('window.process = {}') - 1);
    result = result.replace(/;\s*$/, ""); //remove last ;
    var jsonResult = JSON.parse(result)
    var keys = []
    var values = []
    for (var key in jsonResult) {
        if (jsonResult.hasOwnProperty(key)) {
            keys.push(key)
            values.push(jsonResult[key])
        }
    }

    try {
      var jsonResp = values[4]
      
      console.log(jsonResp.avgRating);
      console.log(id);
      //var searchId = '[href=' + id +']';
      $("[href='"+id+"']").after(jsonResp.avgRating);
      

    } catch (error) {
      console.log("Error: Rating not found");

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
});
