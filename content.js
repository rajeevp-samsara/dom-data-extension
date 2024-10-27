// Capture the text content of the body
(function() {
    // Modify this as needed to capture other parts of the DOM
    let bodyText = document.body.innerText;
  
    // You can also capture specific elements, e.g., only text inside <div> tags
    // let divText = document.querySelector('div').innerText;
  
    // Return the captured text
    return bodyText;
  })();