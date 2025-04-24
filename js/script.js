$(document).ready(function () {

  // Workday: Professor name divs
  $(document).on('mouseenter', 'div[data-automation-id="promptOption"]', function () {
    if (!$(this).next().is('b')) {
      console.log("Create tooltip container!");
      var wrapper = "<b class='tooltip' style='font-size:15px; display:none; width:190px; height:auto; background-color:#d4d7ff; color:#8b0000; text-align:left; border-radius:6px; padding:10px 15px; position:absolute; z-index:10000;'><span style='font-weight:normal;'>Loading...</span></b>";
      $(this).after(wrapper);
    }
  });

  // Tooltip show/hide logic
  $(document).on({
    mouseenter: function () {
      $(this).show();
    },
    mouseleave: function () {
      $(this).hide();
    }
  }, 'b.tooltip');

  // Main RMP lookup logic
  $(document).on({
    mouseenter: function () {
      let tooltip = $(this).next();
      tooltip.show();

      if (tooltip.text().includes("Loading")) {
        tooltip.text("Loading...");

        // Extract professor name from div
        var name = $(this).attr('data-automation-label') || $(this).text();
        name = name.trim().replace(/\s+/g, ' ');
        console.log("Searching for:", name);

        var url = "https://www.ratemyprofessors.com/search/teachers?query=" + name + "&sid=U2Nob29sLTExNDc=";
        chrome.runtime.sendMessage(
          { from: "tasks", message: url, id: name, name: name, secondSearch: false }
        );
      }
    },
    mouseleave: function () {
      $(this).next().hide();
    }
  }, 'div[data-automation-id="promptOption"]');

  // Handle RMP results
  chrome.runtime.onMessage.addListener(function (response, sendResponse) {
    var id = response.id;
    var name = response.name;
    console.log("Returned full name:", name);

    let tooltip = $("div[data-automation-label='" + name + "']").next();

    let kw = "window.__RELAY_STORE__ = ";
    let raw = response.message.substring(response.message.indexOf(kw) + kw.length, response.message.indexOf('window.process = {}') - 1);
    raw = raw.replace(/;\s*$/, "");
    var jsonResult = JSON.parse(raw);

    let values = Object.values(jsonResult);

    try {
      let prof = values.find(v => v && v.legacyId);
      if (!prof) throw new Error("No matching prof object");

      tooltip.html(`<span>${prof.firstName} ${prof.lastName}</span><br/>`);

      if (prof.avgRating > 0)
        tooltip.append(`<span style='font-weight:normal'>Rating: </span>${prof.avgRating}/5<br/>`);
      else
        tooltip.append("<span style='font-weight:normal'>No Rating</span><br/>");

      if (prof.wouldTakeAgainPercent >= 0)
        tooltip.append(`<span style='font-weight:normal'>Would Take Again: </span>${Math.ceil(prof.wouldTakeAgainPercent)}%<br/>`);
      else
        tooltip.append("<span style='font-weight:normal'>No Response</span><br/>");

      if (prof.avgDifficulty > 0)
        tooltip.append(`<span style='font-weight:normal'>Difficulty: </span>${prof.avgDifficulty}/5<br/>`);
      else
        tooltip.append("<span style='font-weight:normal'>No Response</span><br/>");

      tooltip.append(`<span style='margin-top:10px; display: inline-block;'><a style='text-decoration: underline;' href='https://www.ratemyprofessors.com/professor?tid=${prof.legacyId}' target='_blank'>Details</a></span>`);

    } catch (error) {
      console.error("Error parsing RMP data:", error);
      tooltip.text("No results found or error occurred.");
    }
  });
});