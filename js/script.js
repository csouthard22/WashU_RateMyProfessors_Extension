$(document).ready(function(){
    $("a.instructorLink").hover(function(){
        var html = $(this).text().trim();
        console.log(html);
    })
})